export async function sendMessage(botToken, chatId, text, parse_mode, reply_markup) {
	const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
	const data = {
		chat_id: chatId,
		text: text,
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

// sendMediaGroup
// Use this method to send a group of photos, videos, documents or audios as an album. Documents and audio files can be only grouped in an album with messages of the same type. On success, an array of Messages that were sent is returned.

// Parameter	Type	Required	Description
// business_connection_id	String	Optional	Unique identifier of the business connection on behalf of which the message will be sent
// chat_id	Integer or String	Yes	Unique identifier for the target chat or username of the target channel (in the format @channelusername)
// message_thread_id	Integer	Optional	Unique identifier for the target message thread (topic) of the forum; for forum supergroups only
// media	Array of InputMediaAudio, InputMediaDocument, InputMediaPhoto and InputMediaVideo	Yes	A JSON-serialized array describing messages to be sent, must include 2-10 items
// disable_notification	Boolean	Optional	Sends messages silently. Users will receive a notification with no sound.
// protect_content	Boolean	Optional	Protects the contents of the sent messages from forwarding and saving
// message_effect_id	String	Optional	Unique identifier of the message effect to be added to the message; for private chats only
// reply_parameters	ReplyParameters	Optional	Description of the message to reply to

// InputMediaPhoto
// Represents a photo to be sent.

// Field	Type	Description
// type	String	Type of the result, must be photo
// media	String	File to send. Pass a file_id to send a file that exists on the Telegram servers (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or pass “attach://<file_attach_name>” to upload a new one using multipart/form-data under <file_attach_name> name. More information on Sending Files »
// caption	String	Optional. Caption of the photo to be sent, 0-1024 characters after entities parsing
// parse_mode	String	Optional. Mode for parsing entities in the photo caption. See formatting options for more details.
// caption_entities	Array of MessageEntity	Optional. List of special entities that appear in the caption, which can be specified instead of parse_mode
// show_caption_above_media	Boolean	Optional. Pass True, if the caption must be shown above the message media
// has_spoiler	Boolean	Optional. Pass True if the photo needs to be covered with a spoiler animation

// InputMediaDocument
// Represents a general file to be sent.

// Field	Type	Description
// type	String	Type of the result, must be document
// media	String	File to send. Pass a file_id to send a file that exists on the Telegram servers (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or pass “attach://<file_attach_name>” to upload a new one using multipart/form-data under <file_attach_name> name. More information on Sending Files »
// thumbnail	InputFile or String	Optional. Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file, so you can pass “attach://<file_attach_name>” if the thumbnail was uploaded using multipart/form-data under <file_attach_name>. More information on Sending Files »
// caption	String	Optional. Caption of the document to be sent, 0-1024 characters after entities parsing
// parse_mode	String	Optional. Mode for parsing entities in the document caption. See formatting options for more details.
// caption_entities	Array of MessageEntity	Optional. List of special entities that appear in the caption, which can be specified instead of parse_mode
// disable_content_type_detection	Boolean	Optional. Disables automatic server-side content type detection for files uploaded using multipart/form-data. Always True, if the document is sent as part of an album.

// InputMediaVideo
// Represents a video to be sent.

// Field	Type	Description
// type	String	Type of the result, must be video
// media	String	File to send. Pass a file_id to send a file that exists on the Telegram servers (recommended), pass an HTTP URL for Telegram to get a file from the Internet, or pass “attach://<file_attach_name>” to upload a new one using multipart/form-data under <file_attach_name> name. More information on Sending Files »
// thumbnail	InputFile or String	Optional. Thumbnail of the file sent; can be ignored if thumbnail generation for the file is supported server-side. The thumbnail should be in JPEG format and less than 200 kB in size. A thumbnail's width and height should not exceed 320. Ignored if the file is not uploaded using multipart/form-data. Thumbnails can't be reused and can be only uploaded as a new file, so you can pass “attach://<file_attach_name>” if the thumbnail was uploaded using multipart/form-data under <file_attach_name>. More information on Sending Files »
// caption	String	Optional. Caption of the video to be sent, 0-1024 characters after entities parsing
// parse_mode	String	Optional. Mode for parsing entities in the video caption. See formatting options for more details.
// caption_entities	Array of MessageEntity	Optional. List of special entities that appear in the caption, which can be specified instead of parse_mode
// show_caption_above_media	Boolean	Optional. Pass True, if the caption must be shown above the message media
// width	Integer	Optional. Video width
// height	Integer	Optional. Video height
// duration	Integer	Optional. Video duration in seconds
// supports_streaming	Boolean	Optional. Pass True if the uploaded video is suitable for streaming
// has_spoiler	Boolean	Optional. Pass True if the video needs to be covered with a spoiler animation

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
