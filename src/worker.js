import { Redis } from '@upstash/redis/cloudflare';

import { sendMessage, sendPhoto, sendPhotoBlob, sendDocumentBlob, sendDocument, sendVideoBlob } from './send.js';

import { getRequestBody } from './getRequest.js';

import { extractCommand, extractSticker } from './extract.js';

import { getFile, downloadFile } from './getResource.js';

import { trasToGifWithGithubAction } from './githubActions.js';

const { Buffer } = require('node:buffer');

export default {
	async fetch(request, env) {
		const requestBody = await getRequestBody(request);
		const botToken = env.botToken;
		const GITHUB_TOKEN = env.GITHUB_TOKEN;
		const OWNER_ID = env.OWNER_ID;
		const redis = Redis.fromEnv(env);
		const sticker = extractSticker(requestBody);
		const command = extractCommand(requestBody);
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

		if (sticker && stickerecho === 'on') {
			const file_id = sticker.file_id;
			const file = await getFile({ botToken, file_id });
			const file_path = file.result.file_path;
			const fileUrl = `https://api.telegram.org/file/bot${botToken}/${file_path}`;
			// await sendMessage(botToken, OWNER_ID, fileUrl);
			const photoarraybuffer = await downloadFile({ botToken, file_path });
			const photoBlob = new Blob([Buffer.from(photoarraybuffer)], { type: getMimeType(file_path) });
			try {
				// await sendMessage(botToken, OWNER_ID, getMimeType(file_path));
				if (sticker.is_video) {
					// await sendDocumentBlob(botToken, OWNER_ID, photoBlob, 'sticker.webm', 'Sticker Video echo');
					// await sendVideoBlob(botToken, OWNER_ID, photoBlob, 'sticker.webm', 'Sticker Video echo');
					// await sendMessage(botToken, OWNER_ID, 'Sticker Video echo');
					await trasToGifWithGithubAction(fileUrl, GITHUB_TOKEN, () => {
						sendMessage(botToken, OWNER_ID, 'Echo Sticker Video Failed');
					});
				} else {
					await sendPhotoBlob(botToken, OWNER_ID, photoBlob, null, 'Sticker echo');
				}
			} catch (error) {
				await sendMessage(botToken, OWNER_ID, `Error: ${error.message}`);
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

function getExtension(filePath) {
	const lastDotIndex = filePath.lastIndexOf('.');
	if (lastDotIndex === -1) return ''; // No extension found
	return filePath.substring(lastDotIndex).toLowerCase();
}

// Function to get MIME type based on file extension
function getMimeType(filePath) {
	const ext = getExtension(filePath);
	switch (ext) {
		case '.jpg':
		case '.jpeg':
			return 'image/jpeg';
		case '.png':
			return 'image/png';
		case '.gif':
			return 'image/gif';
		case '.webp':
			return 'image/webp';
		case '.svg':
			return 'image/svg+xml';
		case '.mp4':
			return 'video/mp4';
		case '.webm':
			return 'video/webm';
		case '.ogg':
			return 'video/ogg';
		case '.mp3':
			return 'audio/mpeg';
		case '.wav':
			return 'audio/wav';
		case '.pdf':
			return 'application/pdf';
		case '.doc':
			return 'application/msword';
		case '.docx':
			return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
		case '.xls':
			return 'application/vnd.ms-excel';
		case '.xlsx':
			return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
		case '.zip':
			return 'application/zip';
		case '.gz':
			return 'application/gzip';
		default:
			return 'application/octet-stream'; // Default MIME type for unknown types
	}
}
