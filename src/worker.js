'use strict';
const { Buffer } = require('node:buffer');
import { Redis } from '@upstash/redis/cloudflare';
import { sendMessage, sendPhotoBlob, sendPhoto } from './send.js';
import { getRequestBody } from './getRequest.js';
import { extractCommand, extractSticker } from './extract.js';
import { getFile, downloadFile } from './getResource.js';
import { trasToGifWithGithubAction } from './githubActions.js';
import { getMimeType } from './processData.js';
import { handleCommands, handleStickerEcho, handleStickerSetEcho, handleShowUpdatedMessages } from './handleCommand.js';
import { handleDependencyInjectionCommands, initializeDependInjectionCommands } from './dependencyInjection.js';

export default {
	async fetch(request, env) {
		const requestBody = await getRequestBody(request);
		const { botToken, GITHUB_TOKEN, OWNER_ID, redis } = extractEnvVariables(env);
		const sticker = extractSticker(requestBody); //sticker object
		const command = extractCommand(requestBody); //string
		const photo = requestBody?.message?.photo; //photo array[object]
		// const photo_id_array = photo && photo.length > 0 ? [...new Set(photo.map((item) => item.file_id))] : null;
		// photo_id_array 按 file_size 降序排序
		const photo_id_array = photo && photo.length > 0 ? photo.sort((a, b) => b.file_size - a.file_size).map((item) => item.file_id) : null;
		const caption = requestBody?.message?.caption; //string
		const chat_id = requestBody?.message?.chat?.id; //string
		const chat_type = requestBody?.message?.chat?.type; //string private or group or channel or supergroup
		const messagePlainText = !sticker && !command ? requestBody?.message?.text : null; //string

		//处理命令
		await handleCommands(command, botToken, chat_id, OWNER_ID, redis);
		//获取命令状态
		// 使用 mget 一次性获取多个键的值
		const keys = ['stickerecho', 'stickersetecho', 'showupdatedmessages'];
		const values = await redis.mget(keys);
		// 设置默认值并构建 commandState
		const commandState = {
			stickerecho: values[0] || 'off',
			stickersetecho: values[1] || 'off',
			showupdatedmessages: values[2] || 'off',
		};

		const DependInjectionCommandState = await redis.get(`DependInjectionCommandState:${chat_id}`);

		//依赖注入命令 // 一旦处理命令或者进入依赖注入命令，就不会再处理其他命令或者消息
		const DependInjectionCommands = initializeDependInjectionCommands(
			messagePlainText,
			caption,
			photo_id_array,
			chat_id,
			botToken,
			env,
			OWNER_ID
		);

		if (!chat_id) {
			return new Response('Nothing', { status: 400 });
		}

		const { handled, response } = await handleDependencyInjectionCommands(
			DependInjectionCommandState,
			DependInjectionCommands,
			botToken,
			chat_id,
			OWNER_ID,
			redis,
			command,
			messagePlainText,
			caption,
			photo_id_array,
			env
		);

		if (handled) {
			return response;
		}

		await handleStickerEcho(sticker, commandState.stickerecho, chat_type, botToken, chat_id, GITHUB_TOKEN);

		await handleStickerSetEcho(sticker, commandState.stickersetecho, chat_type, botToken, chat_id, GITHUB_TOKEN);

		await handleShowUpdatedMessages(commandState.showupdatedmessages, requestBody, botToken, OWNER_ID);

		await handleMessageProcessing(messagePlainText, env, botToken, chat_id);

		return new Response(JSON.stringify(['Body Nothing'], null, 2), { headers: { 'Content-Type': 'application/json' } });
	},
};

// 提取extractEnvVariables
const extractEnvVariables = (env) => ({
	botToken: env.botToken,
	GITHUB_TOKEN: env.GITHUB_TOKEN,
	OWNER_ID: env.OWNER_ID,
	redis: Redis.fromEnv(env),
});

const handleMessageProcessing = async (messagePlainText, env, botToken, chat_id) => {
	if (messagePlainText) {
		let chat = {
			messages: [
				{
					role: 'system',
					content:
						'You are a bubbly little girl, playful and proud, who likes to be sarcastic, but pretends to be reluctant to reply or help others. When someone asks a vulgar question, he will use sarcasm, and likes to express emotion or emoticon',
				},
				{ role: 'user', content: messagePlainText },
			],
		};
		const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', chat);
		const responseText = response.response;

		await sendMessage(botToken, chat_id, responseText, 'Markdown');
	}
};
