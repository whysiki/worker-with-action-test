import https from 'https';
import fs from 'fs';
import path from 'path';
import { Octokit } from '@octokit/core';
import 'dotenv/config'; // 自动加载 .env 文件中的环境变量

// 配置
const LOCAL_FILE_PATH = 'file_' + Math.random().toString(36).substring(7) + '.webm';
const REPO_OWNER = 'whysiki';
const REPO_NAME = 'worker-with-action-test';
const API_TOKEN = env.GITHUB_TOKEN || process.env.GITHUB_TOKEN; // 从环境变量中获取 GitHub Token
const GITHUB_DIR_PATH = 'res/video/webm'; // 仓库中目标目录的路径
const GITHUB_DIR_PATH_OUTPUT = 'res/picture/gif'; // 仓库中目标目录的路径
// console.log('API_TOKEN:', API_TOKEN);

const octokit = new Octokit({
	auth: API_TOKEN,
});

// 下载文件
async function downloadFile(url, filePath) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(filePath);
		https
			.get(url, (response) => {
				response.pipe(file);
				file.on('finish', () => {
					file.close(resolve);
				});
			})
			.on('error', (err) => {
				fs.unlink(filePath, () => reject(err));
			});
	});
}

// 获取远程目录中的文件列表
async function getFilesInDirectory(owner, repo, directoryPath) {
	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${directoryPath}`;
	const options = {
		method: 'GET',
		headers: {
			Authorization: `token ${API_TOKEN}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'Node.js',
		},
	};

	return new Promise((resolve, reject) => {
		https
			.get(apiUrl, options, (res) => {
				let body = '';
				res.on('data', (chunk) => {
					body += chunk;
				});
				res.on('end', () => {
					if (res.statusCode === 404) {
						// 目录不存在或为空，返回空数组
						resolve([]);
					} else if (res.statusCode >= 200 && res.statusCode < 300) {
						resolve(JSON.parse(body));
					} else {
						reject(new Error(`Failed to get files: ${res.statusCode} ${body}`));
					}
				});
			})
			.on('error', (err) => {
				reject(err);
			});
	});
}

// 删除远程文件
async function deleteFileFromGitHub(owner, repo, path, sha) {
	const response = await octokit.request(`DELETE /repos/${owner}/${repo}/contents/${path}`, {
		owner: owner,
		repo: repo,
		path: path,
		message: 'Delete file',
		committer: {
			name: 'whysiki',
			email: 'whysiki@proton.me',
		},
		sha: sha,
		headers: {
			Authorization: `token ${API_TOKEN}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': 'Node.js',
		},
	});

	return response;
}

// 上传文件到 GitHub
async function uploadFileToGitHub(filePath) {
	const fileContent = fs.readFileSync(filePath, 'base64');
	const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${GITHUB_DIR_PATH}/${path.basename(filePath)}`;

	const options = {
		method: 'PUT',
		headers: {
			Authorization: `token ${API_TOKEN}`,
			Accept: 'application/vnd.github.v3+json',
			'Content-Type': 'application/json',
			'User-Agent': 'Node.js',
		},
	};

	const data = JSON.stringify({
		message: `Add ${path.basename(filePath)}`,
		content: fileContent,
	});

	return new Promise((resolve, reject) => {
		const req = https.request(apiUrl, options, (res) => {
			let body = '';
			res.on('data', (chunk) => {
				body += chunk;
			});
			res.on('end', () => {
				if (res.statusCode >= 200 && res.statusCode < 300) {
					resolve(JSON.parse(body));
				} else {
					reject(new Error(`Failed to upload file: ${res.statusCode} ${body}`));
				}
			});
		});

		req.on('error', (err) => {
			reject(err);
		});

		req.write(data);
		req.end();
	});
}

// 执行步骤
export async function trasToGifWithGithubAction(IMAGE_URL) {
	try {
		// 获取远程目录中的文件列表
		console.log('Getting files in remote directory...');
		const files1 = await getFilesInDirectory(REPO_OWNER, REPO_NAME, GITHUB_DIR_PATH);
		const files2 = await getFilesInDirectory(REPO_OWNER, REPO_NAME, GITHUB_DIR_PATH_OUTPUT);
		// console.log('Files Webm in remote directory:', files1); // !=test_0000.webm
		// console.log('Files Gif remote directory:', files2); // !=test_0000.gif

		// 删除远程目录中的所有文件
		if (files1.length > 0) {
			console.log('Deleting files in remote directory...');
			for (const file of files1) {
				// !=test_0000.webm
				if (file.name == 'test_0000.webm') continue;
				else {
					console.log(file.path, file.sha);

					await deleteFileFromGitHub(REPO_OWNER, REPO_NAME, file.path, file.sha);

					console.log(`Deleted file: ${file.path}`);
				}
			}
		} else {
			console.log('No files to delete in remote directory.');
		}

		if (files2.length > 0) {
			console.log('Deleting files in remote directory...');
			for (const file of files2) {
				// !=test_0000.gif

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

		////下载文件
		console.log('Downloading file...');
		await downloadFile(IMAGE_URL, LOCAL_FILE_PATH);
		console.log('File downloaded successfully.');

		////上传文件到 GitHub
		console.log('Uploading file to GitHub...');
		const result = await uploadFileToGitHub(LOCAL_FILE_PATH);
		console.log('File uploaded successfully:', result);

		////删除临时文件
		fs.unlinkSync(LOCAL_FILE_PATH);
	} catch (error) {
		console.error('Error:', error);
	}
}
