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
		return await response.arrayBuffer();
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
			const errorText = await response.text();
			throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
		}

		const data = await response.json();
		if (!data.ok) {
			throw new Error(`API error: ${data.description}`);
		}

		return data;
	} catch (error) {
		return { error: error.message };
	}
}
