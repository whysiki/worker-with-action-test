import { sendMessage, sendPhotoBlob } from './send.js';
import { getFile, downloadFile } from './getResource.js';
import { trasToGifWithGithubAction } from './githubActions.js';
import { getMimeType } from './processData.js';
const updateStateAndNotify = async (botToken, chat_id, redis, redisupdatesdict, message) => {
	for (const [key, value] of Object.entries(redisupdatesdict)) {
		await redis.set(key, value);
	}
	if (message) {
		await sendMessage(botToken, chat_id, message);
	}
};
const commandHandlers = {
	stickerechoon: async (botToken, OWNER_ID, redis) => {
		await updateStateAndNotify(botToken, OWNER_ID, redis, { stickerecho: 'on' }, 'Sticker echo enable');
	},
	stickerechooff: async (botToken, OWNER_ID, redis) => {
		await updateStateAndNotify(botToken, OWNER_ID, redis, { stickerecho: 'off' }, 'Sticker echo disable');
	},
	stickersetechoon: async (botToken, chat_id, redis) => {
		await updateStateAndNotify(
			botToken,
			chat_id,
			redis,
			{ stickersetecho: 'on', stickerecho: 'off' },
			'Stickersetecho Command was deprecated'
		);
	},
	stickersetechooff: async (botToken, OWNER_ID, redis) => {
		await updateStateAndNotify(botToken, OWNER_ID, redis, { stickersetecho: 'off' }, 'Stickersetecho Command was deprecated');
	},
	showupdatedmessageson: async (botToken, OWNER_ID, redis) => {
		await updateStateAndNotify(botToken, OWNER_ID, redis, { showupdatedmessages: 'on' }, 'showUpdatedMessagesOn enable');
	},
	showupdatedmessagesoff: async (botToken, OWNER_ID, redis) => {
		await updateStateAndNotify(botToken, OWNER_ID, redis, { showupdatedmessages: 'off' }, 'showUpdatedMessagesOff disable');
	},
	allclose: async (botToken, OWNER_ID, redis) => {
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
	},
};

const handleStart = async (start, botToken, chat_id, OWNER_ID, redis) => {
	if (start === 'on') {
		const url = `https://api.telegram.org/bot${botToken}/getMe`;
		const response = await fetch(url);
		const json = await response.json();
		const botInfo = json;
		const message = `
✨ *Bot Information* ✨

🤖 *Name*: ${botInfo.result.first_name}
👤 *Username*: @${botInfo.result.username}
🆔 *ID*: \`${botInfo.result.id}\`
📱 *Can Join Groups*: ${botInfo.result.can_join_groups ? 'Yes ✅' : 'No ❌'}
📥 *Can Read All Group Messages*: ${botInfo.result.can_read_all_group_messages ? 'Yes ✅' : 'No ❌'}
🔍 *Supports Inline Queries*: ${botInfo.result.supports_inline_queries ? 'Yes ✅' : 'No ❌'}
🏢 *Can Connect to Business*: ${botInfo.result.can_connect_to_business ? 'Yes ✅' : 'No ❌'}
🌐 *Has Main Web App*: ${botInfo.result.has_main_web_app ? 'Yes ✅' : 'No ❌'}
`;
		await sendMessage(botToken, chat_id, message, 'Markdown');
	}
};
const handleStickerEcho = async (
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
	if (sticker && stickerecho === 'on') {
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
			} else if (sticker.is_animated) {
				await sendPhotoBlob(botToken, chat_id, photoBlob, null, 'Sticker echo');
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

// Main function to handle commands
export const handleCommands = async ({
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
}) => {
	if (commandHandlers[command]) {
		await commandHandlers[command](botToken, chat_id, redis);
	}

	const keys = ['stickerecho', 'stickersetecho', 'showupdatedmessages'];
	const values = await redis.mget(keys);
	const commandState = {
		stickerecho: values[0] || 'off',
		stickersetecho: values[1] || 'off',
		showupdatedmessages: values[2] || 'off',
		start: command === 'start' ? 'on' : 'off',
	};

	await handleStart(commandState.start, botToken, chat_id, OWNER_ID, redis);
	await handleStickerEcho(
		sticker,
		commandState.stickerecho,
		chat_type,
		botToken,
		chat_id,
		GITHUB_TOKEN,
		REPO_OWNER,
		REPO_NAME,
		GITHUB_DIR_PATH,
		GITHUB_DIR_PATH_OUTPUT
	);
	await handleStickerSetEcho(sticker, commandState.stickersetecho, chat_type, botToken, chat_id, GITHUB_TOKEN);
	await handleShowUpdatedMessages(commandState.showupdatedmessages, requestBody, botToken, OWNER_ID);
};
