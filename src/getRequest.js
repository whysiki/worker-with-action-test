export async function getRequestBody(request) {
	if (request.method !== 'GET' && request.method !== 'HEAD') {
		try {
			return await request.json();
		} catch {
			return null;
		}
	}
	return null;
}
