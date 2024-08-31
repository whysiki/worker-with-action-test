// getFile
// Use this method to get basic information about a file and prepare it for downloading. For the moment, bots can download files of up to 20MB in size. On success, a File object is returned. The file can then be downloaded via the link https://api.telegram.org/file/bot<token>/<file_path>, where <file_path> is taken from the response. It is guaranteed that the link will be valid for at least 1 hour. When the link expires, a new one can be requested by calling getFile again.

// Parameter	Type	Required	Description
// file_id	String	Yes	File identifier to get information about
// Note: This function may not preserve the original file name and MIME type. You should save the file's MIME type and name (if available) when the File object is received.

export async function getFile({ botToken, file_id }) {
	const url = `https://api.telegram.org/bot${botToken}/getFile`;
	const data = {
		file_id: file_id,
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

export async function downloadFile({ botToken, file_path }) {
	const url = `https://api.telegram.org/file/bot${botToken}/${file_path}`;

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		// return await response.blob();
		return await response.arrayBuffer();
		// return await response.buffer();
	} catch (error) {
		return { error: error.message };
	}
}

export async function getStickerSet(botToken, name) {
	const encodedName = encodeURIComponent(name);
	const url = `https://api.telegram.org/bot${botToken}/getStickerSet?name=${encodedName}`;

	try {
		const response = await fetch(url);

		if (!response.ok) {
			const errorText = await response.text(); // 读取响应体以获取更多错误信息
			throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
		}

		const data = await response.json();

		// 检查 API 响应中的成功标志
		if (!data.ok) {
			throw new Error(`API error: ${data.description}`);
		}

		return data;
	} catch (error) {
		return { error: error.message };
	}
}
