export function getExtension(filePath) {
	const lastDotIndex = filePath.lastIndexOf('.');
	if (lastDotIndex === -1) return ''; // No extension found
	return filePath.substring(lastDotIndex).toLowerCase();
}

// Function to get MIME type based on file extension
export function getMimeType(filePath) {
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
