'use strict';

import { Redis } from '@upstash/redis/cloudflare';

import { sendMessage, sendPhoto, sendPhotoBlob, sendDocumentBlob, sendDocument, sendVideoBlob, sendMediaGroup } from './send.js';

import { getRequestBody } from './getRequest.js';

import { extractCommand, extractSticker } from './extract.js';

import { getFile, downloadFile, getStickerSet } from './getResource.js';

import { trasToGifWithGithubAction } from './githubActions.js';

import { getMimeType, getExtension } from './processData.js';

const { Buffer } = require('node:buffer');

export default {
	async fetch(request, env) {
		const requestBody = await getRequestBody(request); // message= requestBody.message
		const botToken = env.botToken;
		const GITHUB_TOKEN = env.GITHUB_TOKEN;
		const OWNER_ID = env.OWNER_ID;

		const redis = Redis.fromEnv(env);
		const sticker = extractSticker(requestBody); //sticker object
		const command = extractCommand(requestBody);

		const chat_id = requestBody?.message?.chat?.id;
		const chat_type = requestBody?.message?.chat?.type; //supergroup, private, group
		const chat_title = requestBody?.message?.chat?.title;
		const message_from = requestBody?.message?.from;
		const message_from_id = message_from?.id;
		const message_from_is_bot = message_from?.is_bot;
		const message_from_first_name = message_from?.first_name;
		const message_from_last_name = message_from?.last_name;
		const message_from_username = message_from?.username;
		const message_from_language_code = message_from?.language_code;
		const message_from_is_premium = message_from?.is_premium;

		const messagePlainText = !sticker && !command ? requestBody?.message?.text : null;

		// await sendMessage(botToken, OWNER_ID, command);
		// await sendMessage(botToken, OWNER_ID, messagePlainText);

		let sendMessageRespJson = ['Body Nothing'];
		let showupdatedmessages = await redis.get('showupdatedmessages');
		let stickerecho = await redis.get('stickerecho');
		let stickersetecho = await redis.get('stickersetecho');

		const DependInjectionCommandState = await redis.get(`DependInjectionCommandState:${chat_id}`);

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
						const inputs = {
							prompt: messagePlainText,
						};
						const response = await env.AI.run('@cf/stabilityai/stable-diffusion-xl-base-1.0', inputs);
						const response2 = new Response(response, {
							headers: {
								'content-type': 'image/png',
							},
						});
						const arrayBuffer = await response2.arrayBuffer();

						const photoBlob = new Blob([arrayBuffer], { type: 'image/png' });

						await sendPhotoBlob(botToken, chat_id, photoBlob, null, messagePlainText);
					} catch (error) {
						await sendMessage(botToken, OWNER_ID, `Error: ${error.message}`);
					}
				},
			},
		};

		if (DependInjectionCommandState) {
			try {
				const DependInjectionCommandStateObj = DependInjectionCommandState;
				const command = DependInjectionCommandStateObj?.command;
				const status = DependInjectionCommandStateObj?.status;
				const HandleInputFunction = DependInjectionCommands[command]?.HandleInputFunction;
				const ImplementFunction = DependInjectionCommands[command]?.ImplementFunction;
				const middledatas = DependInjectionCommandStateObj?.middledatas;

				if (command && DependInjectionCommands[command] && HandleInputFunction && ImplementFunction) {
					if (command === 'greet' && status === 'waiting_for_input') {
						const messagePlainText = await HandleInputFunction();
						await ImplementFunction(messagePlainText);
					}
					if (command === 'texttoimage' && status === 'waiting_for_input') {
						const messagePlainText = await HandleInputFunction();
						await ImplementFunction(messagePlainText);
					}
				}
				if (chat_id && botToken) await sendMessage(botToken, chat_id, 'DependInjectionCommandState Done');
			} catch (error) {
				await sendMessage(botToken, OWNER_ID, `Error: ${error.message}`);
			} finally {
				await redis.del(`DependInjectionCommandState:${chat_id}`);
				return new Response('DependInjectionCommandState Done', { status: 200 });
			}
		} else {
			if (command && DependInjectionCommands[command] && chat_id) {
				// 设置初始状态, 一旦接受依赖注入的command, 就设置为waiting_for_input状态
				if (command === 'greet' && chat_id && botToken) {
					await sendMessage(botToken, chat_id, 'Please input your name');
					await redis.set(
						`DependInjectionCommandState:${chat_id}`,
						JSON.stringify({ command: command, status: 'waiting_for_input', middledatas: {} })
					);
				}
				if (command === 'texttoimage' && chat_id && botToken) {
					await sendMessage(botToken, chat_id, 'Please input your text');
					await redis.set(
						`DependInjectionCommandState:${chat_id}`,
						JSON.stringify({ command: command, status: 'waiting_for_input', middledatas: {} })
					);
				}
				return new Response('DependInjectionCommandState Done', { status: 200 });
			}
		}

		if (!chat_id) {
			await sendMessage(botToken, OWNER_ID, 'No chat_id');
			return new Response('No chat_id', { status: 400 });
		}

		if (messagePlainText) {
			// await sendMessage(botToken, chat_id, messagePlainText, 'Markdown');

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

		if (command === 'stickerechoon') {
			await sendMessage(botToken, OWNER_ID, 'Sticker echo enable');
			await redis.set('stickerecho', 'on');
			stickerecho = 'on';
		}
		if (command === 'stickerechooff') {
			await sendMessage(botToken, OWNER_ID, 'Sticker echo disable');
			await redis.set('stickerecho', 'off');
			stickerecho = 'off';
		}

		if (command === 'stickersetechoon') {
			await sendMessage(botToken, OWNER_ID, 'disable');
			await redis.set('stickersetecho', 'on');
			stickersetecho = 'on';
		}

		if (command === 'stickersetechooff') {
			await sendMessage(botToken, OWNER_ID, 'disable');
			await redis.set('stickersetecho', 'off');
			stickersetecho = 'off';
		}

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

		if (requestBody) {
			if (command === 'showupdatedmessageson') {
				await sendMessage(botToken, OWNER_ID, 'showUpdatedMessagesOn enable');
				await redis.set('showupdatedmessages', 'on');
				showupdatedmessages = 'on';
			} else if (command === 'showupdatedmessagesoff') {
				await sendMessage(botToken, OWNER_ID, 'showUpdatedMessagesOff disable');
				await redis.set('showupdatedmessages', 'off');
				showupdatedmessages = 'off';
			}
		}
		if (showupdatedmessages === 'on' && requestBody) {
			sendMessageRespJson = await sendMessage(
				botToken,
				OWNER_ID,
				`
    \`\`\`json
    ${JSON.stringify(requestBody, null, 2)}
    \`\`\`
    `,
				'Markdown'
			);
		}
		return new Response(JSON.stringify(sendMessageRespJson, null, 2), {
			headers: { 'Content-Type': 'application/json' },
		});
	},
};

// if (sticker && sticker.set_name && stickersetecho === 'on' && chat_type === 'private' && stickerecho === 'off') {
// 	// await sendMessage(botToken, OWNER_ID, 'getStickerSet Test');

// 	const set_name = sticker.set_name;
// 	// await sendMessage(botToken, OWNER_ID, `sticker.set_name: ${set_name}`);
// 	const stickerSet = await getStickerSet(botToken, set_name);
// 	if (stickerSet.result && stickerSet.result.stickers) {
// 		const stickerSetStickers = stickerSet.result.stickers;
// 		const length_stickerSetStickers = stickerSetStickers.length;
// 		// await sendMessage(botToken, chat_id, `length_stickerSetStickers: ${length_stickerSetStickers}`);
// 		let stickerVideosfileUrlArray = [];
// 		async function processStickerSet(stickerSetStickers, botToken, chat_id) {
// 			// 处理所有的 stickers
// 			const promises = stickerSetStickers.map(async (sticker) => {
// 				try {
// 					const file_id = sticker.file_id;

// 					const file = await getFile({ botToken, file_id });
// 					const file_path = file.result.file_path;
// 					const fileUrl = `https://api.telegram.org/file/bot${botToken}/${file_path}`;
// 					const photoarraybuffer = await downloadFile({ botToken, file_path });

// 					// 在浏览器中直接使用 photoarraybuffer
// 					const photoBlob = new Blob([photoarraybuffer], { type: getMimeType(file_path) });

// 					// await sendPhotoBlob(botToken, chat_id, photoBlob, null, 'Sticker echo');
// 					if (sticker.is_video) {
// 						stickerVideosfileUrlArray.push(fileUrl);
// 					} else {
// 						await sendPhotoBlob(botToken, chat_id, photoBlob, null, 'Sticker echo');
// 					}

// 					return {
// 						type: getMimeType(file_path),
// 						media: photoBlob,
// 					};
// 				} catch (error) {
// 					console.error(`Error processing sticker ${sticker.file_id}:`, error);
// 					return null;
// 				}
// 			});

// 			await Promise.all(promises);

// 			// 处理 stickerVideosfileUrlArray
// 			await trasToGifWithGithubAction(
// 				stickerVideosfileUrlArray,
// 				GITHUB_TOKEN,
// 				() => {
// 					sendMessage(botToken, chat_id, 'Echo Sticker Video Failed');
// 				},
// 				chat_id
// 			);

// 			// 等待所有 Promise 完成
// 			// const inputMediaPhotos = await Promise.all(promises);

// 			// // 过滤掉可能为 null 的项
// 			// const validInputMediaPhotos = inputMediaPhotos.filter((item) => item !== null);

// 			// // 调用 sendMediaGroup 方法
// 			// await sendMediaGroup(botToken, chat_id, validInputMediaPhotos.slice(1, 4));
// 		}

// 		// await processStickerSet(stickerSetStickers, botToken, chat_id);

// 		// 对stickerSetStickers进行分组分批处理，每组4个
// 		const groupSize = 4;
// 		for (let i = 0; i < stickerSetStickers.length; i += groupSize) {
// 			const group = stickerSetStickers.slice(i, i + groupSize);
// 			await processStickerSet(group, botToken, chat_id);
// 			// 等待一段时间
// 			await new Promise((resolve) => setTimeout(resolve, 5000));
// 		}
// 	}
// }
