'use strict';
const { Buffer } = require('node:buffer');
import { Redis } from '@upstash/redis/cloudflare';
import { sendMessage } from './send.js';
import { getRequestBody } from './getRequest.js';
import { extractCommand, extractSticker } from './extract.js';
import { handleCommands } from './handleCommand.js';
import { handleDependencyInjection } from './dependencyInjection.js';

// 验证Webhook密钥令牌
const verifyWebhookSecretToken = (env, request) => {
	// Allow HEAD requests to bypass token check
	if (request.method === 'HEAD' || !request?.json() || !request?.json()?.message) {
		return true;
	}

	const tgWebhooksecretToken = env.WEBHOOK_SECRET_TOKEN;
	const requestToken = request.headers.get('x-telegram-bot-api-secret-token');

	// Check if both tokens exist and match
	return tgWebhooksecretToken && requestToken && tgWebhooksecretToken === requestToken;
};

// 提取extractEnvVariables
const extractEnvVariables = (env) => ({
	botToken: env.botToken,
	GITHUB_TOKEN: env.GITHUB_TOKEN,
	OWNER_ID: env.OWNER_ID,
	redis: Redis.fromEnv(env),
	REPO_OWNER: env.REPO_OWNER, //'whysiki';
	REPO_NAME: env.REPO_NAME, //'worker-with-action-test';
	GITHUB_DIR_PATH: env.GITHUB_DIR_PATH, //'res/video/webm'; // 仓库中目标目录的路径
	GITHUB_DIR_PATH_OUTPUT: env.GITHUB_DIR_PATH_OUTPUT, //'res/picture/gif'; // 仓库中目标目录的路径
});

export default {
	async fetch(request, env) {
		//
		// 整个bot所有依赖参数
		const requestBody = await getRequestBody(request);
		const { botToken, GITHUB_TOKEN, OWNER_ID, redis, REPO_OWNER, REPO_NAME, GITHUB_DIR_PATH, GITHUB_DIR_PATH_OUTPUT } =
			extractEnvVariables(env);
		// await sendMessage(botToken, OWNER_ID, env.WEBHOOK_SECRET_TOKEN, 'Markdown');
		// return new Response(JSON.stringify(['Body Nothing'], null, 2), { headers: { 'Content-Type': 'application/json' } });
		if (!verifyWebhookSecretToken(env, request)) {
			await sendMessage(botToken, OWNER_ID, 'Unauthorized WebhookSecretToken', 'Markdown');
			return new Response('Unauthorized', { status: 401 });
		}
		const sticker = extractSticker(requestBody); //sticker object
		const command = extractCommand(requestBody); //string
		const photo = requestBody?.message?.photo; //photo array[object]
		const photo_id_array = photo && photo.length > 0 ? photo.sort((a, b) => b.file_size - a.file_size).map((item) => item.file_id) : null;
		const caption = requestBody?.message?.caption; //string
		const chat_id = requestBody?.message?.chat?.id; //string
		const message_id = requestBody?.message?.message_id; //int
		const chat_type = requestBody?.message?.chat?.type; //string private or group or channel or supergroup
		const messagePlainText = !sticker && !command ? requestBody?.message?.text : null; //string
		const reply_to_message = requestBody?.message?.reply_to_message; //object
		//
		const message_from = {
			id: requestBody?.message?.from?.id,
			is_bot: requestBody?.message?.from?.is_bot, //bool
			first_name: requestBody?.message?.from?.first_name,
			last_name: requestBody?.message?.from?.last_name,
			username: requestBody?.message?.from?.username,
			language_code: requestBody?.message?.from?.language_code,
			is_premium: requestBody?.message?.from?.is_premium, //bool
		};
		//
		//
		//处理依赖注入命令
		/// 一旦处理命令或者进入依赖注入命令，就不会再处理其他命令或者消息
		if (message_from.is_bot === false && message_from.id) {
			const { handled, response } = await handleDependencyInjection({
				redis,
				botToken,
				chat_id,
				OWNER_ID,
				command,
				messagePlainText,
				caption,
				photo_id_array,
				env,
				message_from,
				message_id,
				reply_to_message,
			});
			if (handled) return response;
		}

		//
		//
		//处理普通命令
		//sticker echo only on private chat
		await handleCommands({
			command,
			botToken,
			chat_id,
			OWNER_ID,
			redis,
			sticker,
			chat_type,
			GITHUB_TOKEN,
			REPO_OWNER,
			REPO_NAME,
			GITHUB_DIR_PATH,
			GITHUB_DIR_PATH_OUTPUT,
			requestBody,
			messagePlainText,
			env,
			message_from,
			message_id,
			reply_to_message,
		});
		//处理其他文本消息 不包括回复消息
		if (!reply_to_message) await handleDefaultTextMessageProcessing(messagePlainText, env, botToken, chat_id, redis);

		return new Response(JSON.stringify(['Body Nothing'], null, 2), { headers: { 'Content-Type': 'application/json' } });
	},
};

//默认处理其他文本消息
const handleDefaultTextMessageProcessing = async (messagePlainText, env, botToken, chat_id, redis) => {
	if (messagePlainText) {
		const system_setting =
			(await redis.get('DefaultTextMessageProcessingSystemSetting')) ||
			'You are a bubbly little girl, playful and proud, who likes to be sarcastic, but pretends to be reluctant to reply or help others. When someone asks a vulgar question, he will use sarcasm, and likes to express emotion or emoticon';
		let chat = {
			messages: [
				{
					role: 'system',
					content: system_setting,
				},
				{ role: 'user', content: messagePlainText },
			],
		};
		const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', chat);
		const responseText = response.response;

		await sendMessage(botToken, chat_id, responseText, 'Markdown');
	}
};
