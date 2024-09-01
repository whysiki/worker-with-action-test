import { sendMessage, sendPhotoBlob } from './send.js';
import { getFile, downloadFile } from './getResource.js';
import { trasToGifWithGithubAction } from './githubActions.js';
import { getMimeType } from './processData.js';

//一次性处理命令
export const handleCommands = async (command, botToken, chat_id, OWNER_ID, redis) => {
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

export const handleStickerEcho = async (
	sticker,
	stickerecho,
	chat_type,
	botToken,
	chat_id,
	GITHUB_TOKEN,
	REPO_OWNER,
	REPO_NAME,
	GITHUB_DIR_PATH,
	GITHUB_DIR_PATH_OUTPUT
) => {
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
					chat_id,
					REPO_OWNER,
					REPO_NAME,
					GITHUB_DIR_PATH,
					GITHUB_DIR_PATH_OUTPUT
				);
			} else {
				await sendPhotoBlob(botToken, chat_id, photoBlob, null, 'Sticker echo');
			}
		} catch (error) {
			await sendMessage(botToken, chat_id, `Error: ${error.message}`);
		}
	}
};

export const handleStickerSetEcho = async (sticker, stickersetecho, chat_type, botToken, chat_id, GITHUB_TOKEN) => {
	if (sticker && stickersetecho === 'on' && chat_type === 'private') {
		await sendMessage(botToken, chat_id, 'Stickersetecho Command was deprecated');
	}
};

export const handleShowUpdatedMessages = async (showupdatedmessages, requestBody, botToken, OWNER_ID) => {
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
