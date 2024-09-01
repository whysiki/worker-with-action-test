import { sendMessage, sendPhotoBlob } from './send.js';
import { getFile, downloadFile } from './getResource.js';

// 一旦处理命令或者进入依赖注入命令，就不会再处理其他命令或者消息
export const handleDependencyInjectionCommands = async (
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
				const input = await HandleInputFunction(); //  闭包传递的函数已经有了参数
				await ImplementFunction(...input);
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

const Greet = {
	handleInput: async (messagePlainText, chat_id, botToken) => {
		if (
			messagePlainText &&
			typeof messagePlainText === 'string' &&
			messagePlainText.length > 0 &&
			messagePlainText.length < 20 &&
			chat_id &&
			botToken
		) {
			return [messagePlainText];
		} else {
			await sendMessage(botToken, chat_id, 'ErrorInputFormat');
			throw new Error('ErrorInputFormat');
		}
	},

	implement: async (messagePlainText, botToken, chat_id, OWNER_ID) => {
		try {
			await sendMessage(botToken, chat_id, `Hello, ${messagePlainText}`);
		} catch (error) {
			await sendMessage(botToken, OWNER_ID, `Error: ${error.message}`);
		}
	},
};

const TextToImage = {
	handleInput: async (messagePlainText, chat_id, botToken) => {
		if (
			messagePlainText &&
			typeof messagePlainText === 'string' &&
			messagePlainText.length > 0 &&
			messagePlainText.length < 1000 &&
			chat_id &&
			botToken
		) {
			return [messagePlainText];
		} else {
			await sendMessage(botToken, chat_id, 'ErrorInputFormat');
			throw new Error('ErrorInputFormat');
		}
	},

	implement: async (messagePlainText, env, botToken, chat_id, OWNER_ID) => {
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
};

const ImageToText = {
	handleInput: async (caption, photo_id_array, chat_id, botToken) => {
		if (caption && photo_id_array && photo_id_array.length > 0 && chat_id && botToken) {
			return [photo_id_array[0], caption];
		} else {
			await sendMessage(botToken, chat_id, 'ErrorInputFormat');
			throw new Error('ErrorInputFormat');
		}
	},

	implement: async (photo_id, caption, env, botToken, chat_id, OWNER_ID) => {
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
};

const ImageToImage = {
	handleInput: async (caption, photo_id_array, chat_id, botToken) => {
		if (caption && photo_id_array && photo_id_array.length > 0 && chat_id && botToken) {
			return [photo_id_array[0], caption];
		} else {
			await sendMessage(botToken, chat_id, 'ErrorInputFormat');
			throw new Error('ErrorInputFormat');
		}
	},

	implement: async (photo_id, caption, env, botToken, chat_id, OWNER_ID) => {
		try {
			const file = await getFile({ botToken, file_id: photo_id });
			const file_path = file.result.file_path;
			const photoarraybuffer = await downloadFile({ botToken, file_path });
			const input = {
				prompt: caption,
				image: [...new Uint8Array(photoarraybuffer)],
			};
			const response = await env.AI.run('@cf/runwayml/stable-diffusion-v1-5-img2img', input); // image to image
			const response2 = new Response(response, { headers: { 'content-type': 'image/png' } });
			const arrayBuffer = await response2.arrayBuffer();
			const photoBlob = new Blob([arrayBuffer], { type: 'image/png' });
			await sendPhotoBlob(botToken, chat_id, photoBlob, null, caption);
		} catch (error) {
			await sendMessage(botToken, OWNER_ID, `Error: ${error.message}`);
		}
	},
};

export const initializeDependInjectionCommands = (messagePlainText, caption, photo_id_array, chat_id, botToken, env, OWNER_ID) => ({
	greet: {
		HandleInputFunction: () => Greet.handleInput(messagePlainText, chat_id, botToken),
		ImplementFunction: (messagePlainText) => Greet.implement(messagePlainText, botToken, chat_id, OWNER_ID),
	},
	texttoimage: {
		HandleInputFunction: () => TextToImage.handleInput(messagePlainText, chat_id, botToken),
		ImplementFunction: (messagePlainText) => TextToImage.implement(messagePlainText, env, botToken, chat_id, OWNER_ID),
	},
	imagetotext: {
		HandleInputFunction: () => ImageToText.handleInput(caption, photo_id_array, chat_id, botToken),
		ImplementFunction: (photo_id, caption) => ImageToText.implement(photo_id, caption, env, botToken, chat_id, OWNER_ID),
	},
	image2image: {
		HandleInputFunction: () => ImageToImage.handleInput(caption, photo_id_array, chat_id, botToken),
		ImplementFunction: (photo_id, caption) => ImageToImage.implement(photo_id, caption, env, botToken, chat_id, OWNER_ID),
	},
});
