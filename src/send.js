export async function sendMessage(botToken, chatId, text, parse_mode, reply_markup, reply_parameters) {
	// ReplyParameters
	// Describes reply parameters for the message that is being sent.

	// Field	Type	Description
	// message_id	Integer	Identifier of the message that will be replied to in the current chat, or in the chat chat_id if it is specified
	// chat_id	Integer or String	Optional. If the message to be replied to is from a different chat, unique identifier for the chat or username of the channel (in the format @channelusername). Not supported for messages sent on behalf of a business account.
	// allow_sending_without_reply	Boolean	Optional. Pass True if the message should be sent even if the specified message to be replied to is not found. Always False for replies in another chat or forum topic. Always True for messages sent on behalf of a business account.
	// quote	String	Optional. Quoted part of the message to be replied to; 0-1024 characters after entities parsing. The quote must be an exact substring of the message to be replied to, including bold, italic, underline, strikethrough, spoiler, and custom_emoji entities. The message will fail to send if the quote isn't found in the original message.
	// quote_parse_mode	String	Optional. Mode for parsing entities in the quote. See formatting options for more details.
	// quote_entities	Array of MessageEntity	Optional. A JSON-serialized list of special entities that appear in the quote. It can be specified instead of quote_parse_mode.
	// quote_position	Integer	Optional. Position of the quote in the original message in UTF-16 code units
	const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
	const data = {
		chat_id: chatId,
		text: text,
		parse_mode: parse_mode,
		reply_markup: reply_markup,
		reply_parameters: reply_parameters,
	};

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		return { error: error.message };
	}
}

// sendPhoto
export async function sendPhoto(botToken, chatId, photoTgid_or_weburl, caption, parse_mode, reply_markup) {
	const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
	const data = {
		chat_id: chatId,
		photo: photoTgid_or_weburl,
		caption: caption,
		parse_mode: parse_mode,
		reply_markup: reply_markup,
	};

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		return { error: error.message };
	}
}

// sendPhotoBlob
export async function sendPhotoBlob(botToken, chatId, photoBlob, filename, caption, parse_mode, reply_markup) {
	const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
	const data = new FormData();
	data.append('chat_id', chatId);
	data.append('photo', photoBlob, filename);
	if (caption) data.append('caption', caption);
	if (parse_mode) data.append('parse_mode', parse_mode);
	if (reply_markup) data.append('reply_markup', JSON.stringify(reply_markup));

	try {
		const response = await fetch(url, {
			method: 'POST',
			body: data,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		return { error: error.message };
	}
}

// sendDocument
export async function sendDocument(botToken, chatId, documentTgid_or_weburl, caption, parse_mode, reply_markup) {
	const url = `https://api.telegram.org/bot${botToken}/sendDocument`;
	const data = {
		chat_id: chatId,
		document: documentTgid_or_weburl,
		caption: caption,
		parse_mode: parse_mode,
		reply_markup: reply_markup,
	};

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		return { error: error.message };
	}
}

// sendDocumentBlob
export async function sendDocumentBlob(botToken, chatId, documentBlob, filename, caption, parse_mode, reply_markup) {
	const url = `https://api.telegram.org/bot${botToken}/sendDocument`;
	const data = new FormData();
	data.append('chat_id', chatId);
	data.append('document', documentBlob, filename);
	if (caption) data.append('caption', caption);
	if (parse_mode) data.append('parse_mode', parse_mode);
	if (reply_markup) data.append('reply_markup', JSON.stringify(reply_markup));

	try {
		const response = await fetch(url, {
			method: 'POST',
			body: data,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		return { error: error.message };
	}
}

export async function sendVideoBlob(botToken, chatId, videoBlob, filename, caption, parse_mode, reply_markup) {
	const url = `https://api.telegram.org/bot${botToken}/sendVideo`;
	const data = new FormData();
	data.append('chat_id', chatId);
	data.append('video', videoBlob, filename);
	if (caption) data.append('caption', caption);
	if (parse_mode) data.append('parse_mode', parse_mode);
	if (reply_markup) data.append('reply_markup', JSON.stringify(reply_markup));

	try {
		const response = await fetch(url, {
			method: 'POST',
			body: data,
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		return { error: error.message };
	}
}

export async function sendMediaGroup(
	botToken, // required
	chatId, // required
	media, // required
	message_thread_id,
	disable_notification,
	protect_content,
	message_effect_id,
	reply_parameters,
	business_connection_id
) {
	const url = `https://api.telegram.org/bot${botToken}/sendMediaGroup`;
	const data = {
		chat_id: chatId,
		media: media,
		disable_notification: disable_notification,
		protect_content: protect_content,
		message_effect_id: message_effect_id,
		reply_parameters: reply_parameters,
		message_thread_id: message_thread_id,
		business_connection_id: business_connection_id,
	};

	try {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		return await response.json();
	} catch (error) {
		return { error: error.message };
	}
}
