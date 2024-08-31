// 配置
const REPO_OWNER = 'whysiki';
const REPO_NAME = 'worker-with-action-test';
const GITHUB_DIR_PATH = 'res/video/webm'; // 仓库中目标目录的路径
const GITHUB_DIR_PATH_OUTPUT = 'res/picture/gif'; // 仓库中目标目录的路径

// 执行步骤
export async function trasToGifWithGithubAction(IMAGE_URL_Array_or_Single, API_TOKEN, Failed_Callback_Function, ChatId) {
	// 获取远程目录中的文件列表
	async function getFilesInDirectory(owner, repo, directoryPath) {
		const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${directoryPath}`;
		const options = {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${API_TOKEN}`,
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': 'Node.js',
			},
		};

		try {
			const response = await fetch(apiUrl, options);
			if (response.status === 404) {
				// 目录不存在或为空，返回空数组
				return [];
			} else if (response.ok) {
				const data = await response.json();
				return data;
			} else {
				throw new Error(`Failed to get files: ${response.status} ${response.statusText}`);
			}
		} catch (error) {
			Failed_Callback_Function();
			throw new Error(`Failed to get files: ${error.message}`);
		}
	}

	// 删除远程文件
	async function deleteFileFromGitHub(owner, repo, path, sha) {
		try {
			const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
			const response = await fetch(url, {
				method: 'DELETE',
				headers: {
					Accept: 'application/vnd.github+json',
					Authorization: `Bearer ${API_TOKEN}`,
					'User-Agent': 'Node.js',
					'X-GitHub-Api-Version': '2022-11-28',
				},
				body: JSON.stringify({
					message: 'Delete file',
					committer: {
						name: 'whysiki',
						email: 'whysiki@proton.me',
					},
					sha: sha,
				}),
			});

			return response.json();
		} catch (error) {
			// console.error('Error:', error.message);
			Failed_Callback_Function();
		}
	}

	// 上传文件到 GitHub
	async function uploadFileToGitHubFromUrl(fileUrl, fileName, message) {
		const response = await fetch(fileUrl);
		if (!response.ok) {
			throw new Error(`Failed to fetch file from URL: ${response.statusText}`);
		}
		const arrayBuffer = await response.arrayBuffer();
		const fileBuffer = Buffer.from(arrayBuffer);
		const fileContent = fileBuffer.toString('base64');
		const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${GITHUB_DIR_PATH}/${fileName}`;

		const options = {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${API_TOKEN}`,
				Accept: 'application/vnd.github.v3+json',
				'Content-Type': 'application/json',
				'User-Agent': 'Node.js',
			},
			body: JSON.stringify({
				message: message || `Uploading file : ${fileName}`,
				content: fileContent,
			}),
		};

		const uploadResponse = await fetch(apiUrl, options);
		if (!uploadResponse.ok) {
			const errorText = await uploadResponse.text();
			throw new Error(`Failed to upload file: ${uploadResponse.status} ${errorText}`);
		}

		console.log(`Uploaded file: ${fileName}`);

		return uploadResponse.json();
	}

	try {
		// 获取远程目录中的文件列表
		const files1 = await getFilesInDirectory(REPO_OWNER, REPO_NAME, GITHUB_DIR_PATH);
		const files2 = await getFilesInDirectory(REPO_OWNER, REPO_NAME, GITHUB_DIR_PATH_OUTPUT);

		// 删除远程目录中的所有文件
		if (files1.length > 0) {
			for (const file of files1) {
				console.log('Deleting files in remote directory...');
				// !=test_0000.webm
				if (file.name == 'test_0000.webm') continue;
				else {
					await deleteFileFromGitHub(REPO_OWNER, REPO_NAME, file.path, file.sha);
				}
			}
		} else {
			console.log('No files to delete in remote directory.');
		}

		if (files2.length > 0) {
			console.log('Deleting giffiles in remote directory...');
			for (const file of files2) {
				if (file.name == 'test_0000.gif') continue;
				else {
					console.log(file.path, file.sha);

					await deleteFileFromGitHub(REPO_OWNER, REPO_NAME, file.path, file.sha);

					console.log(`Deleted file: ${file.path}`);
				}
			}
		} else {
			console.log('No files to delete in remote directory.');
		}

		if (Array.isArray(IMAGE_URL_Array_or_Single)) {
			// 先拿出一个当做末尾的文件，只有其他文件上传完毕后才能上传这个文件
			const lastUrl = IMAGE_URL_Array_or_Single.pop();
			for (let i = 0; i < IMAGE_URL_Array_or_Single.length; i++) {
				const file_name = ChatId + '__' + generateRandomString(7) + '.webm';
				await uploadFileToGitHubFromUrl(IMAGE_URL_Array_or_Single[i], file_name);
			}
			const file_name = ChatId + '__' + generateRandomString(7) + '.webm';
			await uploadFileToGitHubFromUrl(lastUrl, file_name, 'Upload Completed');
		} else if (typeof IMAGE_URL_Array_or_Single === 'string') {
			// 上传文件到 GitHub
			const file_name = ChatId + '__' + generateRandomString(7) + '.webm';
			await uploadFileToGitHubFromUrl(IMAGE_URL_Array_or_Single, file_name, 'Upload Completed');
		} else {
			console.log('Error: IMAGE_URL_Array_or_Single is not a valid type');
			Failed_Callback_Function();
		}
	} catch (error) {
		console.error('Error:', error);
	}
}

function generateRandomString(length) {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result + Date.now().toString(36);
}

// module.exports = trasToGifWithGithubAction;
