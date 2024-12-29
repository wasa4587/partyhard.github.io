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
	  console.log({url, path})
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
					/* Custom CSS you can add to modify the styling of your page */
				  </style>
				`,
				{ html: true }
			  );
			  element.append(
				`
				  <script>
					/* Custom JS you can add to modify something on your page */
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

