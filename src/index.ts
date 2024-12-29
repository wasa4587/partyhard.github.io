export default {
	async fetch(request: Request, env: { BENTO_USERNAME: string; BASE_URL: string }): Promise<Response> {
		const path = new URL(request.url).pathname;
		let url = 'https://bento.me' + path;

		if (path.includes('v1')) {
			url = 'https://api.bento.me' + path;
		}
		if (path == '/privacy-policy') {
			url = 'https://d0a1adcc.privacy-policy-2ci.pages.dev/';
		}
		if (url === 'https://bento.me/') {
			url = `https://bento.me/partyhardio`;
		}

		const headers: HeadersInit = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET,HEAD,POST,OPTIONS',
		};
		console.log({ url, path })
		const response = await fetch(url, { headers });
		const contentType = response.headers.get('content-type');
		let results = await parseResponseByContentType(response, contentType);
		if (!(results instanceof ArrayBuffer)) {
			results = results.replaceAll('https://api.bento.me', "https://partyhard.io");
		}
		headers['content-type'] = contentType || 'text/plain';
		return new Response(results, { headers });
	},
};

async function parseResponseByContentType(response: Response, contentType: string | null): Promise<string | ArrayBuffer> {
	if (!contentType) return await response.text();

	switch (true) {
		case contentType.includes('application/json'):
			return JSON.stringify(await response.json());
		case contentType.includes('text/html'):
			const transformedResponse = new HTMLRewriter()
				.on('body', {
					element(element) {
						element.append(
							`
				  <style>
					.asd123 {
						visibility: hidden;
					}
					.flex.w-full.flex-col.items-center.bg-\\[\\#FBFBFB\\].py-10.xl\\:hidden {							
						visibility: hidden !important;
					}
				
					.fixed.left-16.bottom-\\[52px\\].-m-1.hidden.items-center.space-x-1.rounded-\\[12px\\].p-1.transition-colors.xl\\:flex.\\32 xl\\:space-x-2.duration-400.bg-white.delay-500 {
						visibility: hidden !important;
					}
				  </style>
				`,
							{ html: true }
						);
						element.append(
							`
				  <script>

				  </script>
				`,
							{ html: true }
						);
					},
				})
				.transform(response);
			return await transformedResponse.text();
		case contentType.includes('font'):
		case contentType.includes('image'):
			return await response.arrayBuffer();
		default:
			return await response.text();
	}
}

