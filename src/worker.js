'use strict';

import { Redis } from '@upstash/redis/cloudflare';
import { sendMessage, sendPhotoBlob, sendPhoto } from './send.js';
import { getRequestBody } from './getRequest.js';
import { extractCommand, extractSticker } from './extract.js';
import { getFile, downloadFile } from './getResource.js';
import { trasToGifWithGithubAction } from './githubActions.js';
import { getMimeType } from './processData.js';

const { Buffer } = require('node:buffer');

const extractEnvVariables = (env) => ({
	botToken: env.botToken,
	GITHUB_TOKEN: env.GITHUB_TOKEN,
	OWNER_ID: env.OWNER_ID,
	redis: Redis.fromEnv(env),
});

//一次性处理命令
const handleCommands = async (command, botToken, chat_id, OWNER_ID, redis) => {
	const updateStateAndNotify = async (botToken, chat_id, redis, updates, message) => {
		for (const [key, value] of Object.entries(updates)) {
			await redis.set(key, value);
		}
		if (message) {
			await sendMessage(botToken, chat_id, message);
		}
	};
	switch (command) {
		case 'stickerechoon':
			await updateStateAndNotify(botToken, OWNER_ID, redis, { stickerecho: 'on' }, 'Sticker echo enable');
			break;
		case 'stickerechooff':
			await updateStateAndNotify(botToken, OWNER_ID, redis, { stickerecho: 'off' }, 'Sticker echo disable');
			break;
		case 'stickersetechoon':
			await updateStateAndNotify(
				botToken,
				chat_id,
				redis,
				{ stickersetecho: 'on', stickerecho: 'off' },
				'Stickersetecho Command was deprecated'
			);
			break;
		case 'stickersetechooff':
			await updateStateAndNotify(botToken, OWNER_ID, redis, { stickersetecho: 'off' }, 'Stickersetecho Command was deprecated');
			break;
		case 'showupdatedmessageson':
			await updateStateAndNotify(botToken, OWNER_ID, redis, { showupdatedmessages: 'on' }, 'showUpdatedMessagesOn enable');
			break;
		case 'showupdatedmessagesoff':
			await updateStateAndNotify(botToken, OWNER_ID, redis, { showupdatedmessages: 'off' }, 'showUpdatedMessagesOff disable');
			break;
		case 'allclose':
			await updateStateAndNotify(
				botToken,
				OWNER_ID,
				redis,
				{
					stickerecho: 'off',
					stickersetecho: 'off',
					showupdatedmessages: 'off',
				},
				'All close'
			);
			break;
	}
};

const handleStickerEcho = async (sticker, stickerecho, chat_type, botToken, chat_id, GITHUB_TOKEN) => {
	if (sticker && stickerecho === 'on' && chat_type === 'private') {
		const file_id = sticker.file_id;
		const file = await getFile({ botToken, file_id });
		const file_path = file.result.file_path;
		const fileUrl = `https://api.telegram.org/file/bot${botToken}/${file_path}`;
		const photoarraybuffer = await downloadFile({ botToken, file_path });
		const photoBlob = new Blob([Buffer.from(photoarraybuffer)], { type: getMimeType(file_path) });

		try {
			if (sticker.is_video) {
				await trasToGifWithGithubAction(
					fileUrl,
					GITHUB_TOKEN,
					() => {
						sendMessage(botToken, chat_id, 'Echo Sticker Video Failed');
					},
					chat_id
				);
			} else {
				await sendPhotoBlob(botToken, chat_id, photoBlob, null, 'Sticker echo');
			}
		} catch (error) {
			await sendMessage(botToken, chat_id, `Error: ${error.message}`);
		}
	}
};

const handleStickerSetEcho = async (sticker, stickersetecho, chat_type, botToken, chat_id, GITHUB_TOKEN) => {
	if (sticker && stickersetecho === 'on' && chat_type === 'private') {
		await sendMessage(botToken, chat_id, 'Stickersetecho Command was deprecated');
	}
};

const handleShowUpdatedMessages = async (showupdatedmessages, requestBody, botToken, OWNER_ID) => {
	if (showupdatedmessages === 'on' && requestBody) {
		const sendMessageRespJson = await sendMessage(
			botToken,
			OWNER_ID,
			`\`\`\`json\n${JSON.stringify(requestBody, null, 2)}\n\`\`\``,
			'Markdown'
		);
		return new Response(JSON.stringify(sendMessageRespJson, null, 2), { headers: { 'Content-Type': 'application/json' } });
	}
};

const handleMessageProcessing = async (messagePlainText, env, botToken, chat_id) => {
	if (messagePlainText) {
		let chat = {
			messages: [
				{
					role: 'system',
					content:
						'You are a bubbly little girl, playful and proud, who likes to be sarcastic, but pretends to be reluctant to reply or help others.When someone asks a vulgar question, he will use sarcasm, and likes to express emotion or emoticon',
				},
				{ role: 'user', content: messagePlainText },
			],
		};
		const response = await env.AI.run('@cf/meta/llama-3-8b-instruct', chat);
		const responseText = response.response;

		await sendMessage(botToken, chat_id, responseText, 'Markdown');
	}
};

//一旦处理命令或者进入依赖注入命令，就不会再处理其他命令或者消息
const handleDependencyInjectionCommands = async (
	DependInjectionCommandState,
	DependInjectionCommands,
	botToken,
	chat_id,
	OWNER_ID,
	redis,
	command
) => {
	const setDependInjectionState = async (chat_id, command, message) => {
		await sendMessage(botToken, chat_id, message);
		await redis.set(
			`DependInjectionCommandState:${chat_id}`,
			JSON.stringify({ command: command, status: 'waiting_for_input', middledatas: {} })
		);
	};

	if (DependInjectionCommandState) {
		try {
			const { command, status } = DependInjectionCommandState;
			const { HandleInputFunction, ImplementFunction } = DependInjectionCommands[command] || {};

			if (command && HandleInputFunction && ImplementFunction && status === 'waiting_for_input') {
				if (command === 'greet' || command === 'texttoimage') {
					const messagePlainText = await HandleInputFunction();
					await ImplementFunction(messagePlainText);
				} else if (command === 'imagetotext' || command === 'image2image') {
					const [photo_id, caption] = await HandleInputFunction();
					await ImplementFunction(photo_id, caption);
				}
			}
		} catch (error) {
			await sendMessage(botToken, OWNER_ID, `Error: ${error.message}`);
		} finally {
			if (chat_id && botToken) await sendMessage(botToken, chat_id, 'DependInjectionCommandState Done');
			await redis.del(`DependInjectionCommandState:${chat_id}`);
			return { handled: true, response: new Response('DependInjectionCommandState Done', { status: 200 }) };
		}
	}

	if (command && DependInjectionCommands[command] && chat_id) {
		switch (command) {
			case 'greet':
				await setDependInjectionState(chat_id, command, 'Please input your name');
				break;
			case 'texttoimage':
				await setDependInjectionState(chat_id, command, 'Please input your text');
				break;
			case 'imagetotext':
				await setDependInjectionState(chat_id, command, 'Please send a photo with a caption');
				break;
			case 'image2image':
				await setDependInjectionState(chat_id, command, 'Please send a photo with a caption');
				break;
		}
		return { handled: true, response: new Response('DependInjectionCommandState Done', { status: 200 }) };
	}

	return { handled: false };
};

export default {
	async fetch(request, env) {
		const requestBody = await getRequestBody(request);
		const { botToken, GITHUB_TOKEN, OWNER_ID, redis } = extractEnvVariables(env);
		const sticker = extractSticker(requestBody); //sticker object
		const command = extractCommand(requestBody);

		const photo = requestBody?.message?.photo; //photo array[object]
		const photo_id_array = photo && photo.length > 0 ? [...new Set(photo.map((item) => item.file_id))] : null;
		const caption = requestBody?.message?.caption; //string

		const chat_id = requestBody?.message?.chat?.id;
		const chat_type = requestBody?.message?.chat?.type;
		const messagePlainText = !sticker && !command ? requestBody?.message?.text : null;

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

		//依赖注入命令
		const DependInjectionCommands = {
			greet: {
				HandleInputFunction: async () => {
					if (
						messagePlainText &&
						typeof messagePlainText === 'string' &&
						messagePlainText.length > 0 &&
						messagePlainText.length < 20 &&
						chat_id &&
						botToken
					) {
						return messagePlainText;
					} else {
						await sendMessage(botToken, chat_id, 'ErrorInputFormat');
						throw new Error('ErrorInputFormat');
					}
				},
				ImplementFunction: async (messagePlainText) => {
					try {
						await sendMessage(botToken, chat_id, `Hello, ${messagePlainText}`);
					} catch (error) {
						await sendMessage(botToken, OWNER_ID, `Error: ${error.message}`);
					}
				},
			},
			texttoimage: {
				HandleInputFunction: async () => {
					if (
						messagePlainText &&
						typeof messagePlainText === 'string' &&
						messagePlainText.length > 0 &&
						messagePlainText.length < 1000 &&
						chat_id &&
						botToken
					) {
						return messagePlainText;
					} else {
						await sendMessage(botToken, chat_id, 'ErrorInputFormat');
						throw new Error('ErrorInputFormat');
					}
				},
				ImplementFunction: async (messagePlainText) => {
					try {
						const inputs = { prompt: messagePlainText };
						const response = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', inputs);
						const response2 = new Response(response, { headers: { 'content-type': 'image/png' } });
						const arrayBuffer = await response2.arrayBuffer();
						const photoBlob = new Blob([arrayBuffer], { type: 'image/png' });
						await sendPhotoBlob(botToken, chat_id, photoBlob, null, messagePlainText);
					} catch (error) {
						await sendMessage(botToken, OWNER_ID, `Error: ${error.message}`);
					}
				},
			},
			imagetotext: {
				HandleInputFunction: async () => {
					if (caption && photo_id_array && photo_id_array.length > 0 && chat_id && botToken) {
						return [photo_id_array[0], caption];
					} else {
						await sendMessage(botToken, chat_id, 'ErrorInputFormat');
						throw new Error('ErrorInputFormat');
					}
				},

				ImplementFunction: async (photo_id, caption) => {
					try {
						const file = await getFile({ botToken, file_id: photo_id });
						const file_path = file.result.file_path;
						const photoarraybuffer = await downloadFile({ botToken, file_path });
						const input = {
							image: [...new Uint8Array(photoarraybuffer)],
							prompt: caption,
							max_tokens: 512,
						};
						const response = await env.AI.run('@cf/llava-hf/llava-1.5-7b-hf', input);
						if (response.description) {
							await sendMessage(botToken, chat_id, response.description);
						} else {
							await sendMessage(botToken, chat_id, `\`\`\`json\n${JSON.stringify(response, null, 2)}\n\`\`\``, 'Markdown');
						}
					} catch (error) {
						await sendMessage(botToken, OWNER_ID, `Error: ${error.message}`);
					}
				},
			},
			image2image: {
				HandleInputFunction: async () => {
					if (caption && photo_id_array && photo_id_array.length > 0 && chat_id && botToken) {
						return [photo_id_array[0], caption];
					} else {
						await sendMessage(botToken, chat_id, 'ErrorInputFormat');
						throw new Error('ErrorInputFormat');
					}
				},
				ImplementFunction: async (photo_id, caption) => {
					try {
						const file = await getFile({ botToken, file_id: photo_id });
						const file_path = file.result.file_path;
						const photoarraybuffer = await downloadFile({ botToken, file_path });
						const input = {
							prompt: caption,
							image: [...new Uint8Array(photoarraybuffer)],
						};
						const response = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', input); //image to image
						const response2 = new Response(response, { headers: { 'content-type': 'image/png' } });
						const arrayBuffer = await response2.arrayBuffer();
						const photoBlob = new Blob([arrayBuffer], { type: 'image/png' });
						await sendPhotoBlob(botToken, chat_id, photoBlob, null, caption);
					} catch (error) {
						await sendMessage(botToken, OWNER_ID, `Error: ${error.message}`);
					}
				},
			},
		};

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
			command
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
