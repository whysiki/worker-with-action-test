import { Redis } from '@upstash/redis/cloudflare';

import { sendMessage, sendPhoto, sendPhotoBlob, sendDocumentBlob, sendDocument, sendVideoBlob } from './send.js';

import { getRequestBody } from './getRequest.js';

import { extractCommand, extractSticker } from './extract.js';

import { getFile, downloadFile } from './getResource.js';

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
		const sticker = extractSticker(requestBody);
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

		// await sendMessage(botToken, OWNER_ID, `bot Started`);
		//
		// await sendMessage(botToken, OWNER_ID, `chat_id: ${chat_id}`);
		// await sendMessage(botToken, OWNER_ID, `chat_type: ${chat_type}`);
		// await sendMessage(botToken, OWNER_ID, `chat_title: ${chat_title}`);
		// await sendMessage(botToken, OWNER_ID, `message_from: ${message_from}`);
		// await sendMessage(botToken, OWNER_ID, `message_from_id: ${message_from_id}`);

		if (!chat_id) {
			await sendMessage(botToken, OWNER_ID, 'No chat_id');
			return new Response('No chat_id', { status: 400 });
		}

		let sendMessageRespJson = ['Body Nothing'];
		let showupdatedmessages = await redis.get('showupdatedmessages');
		let stickerecho = await redis.get('stickerecho');

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
