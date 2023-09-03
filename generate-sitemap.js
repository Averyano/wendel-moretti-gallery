const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

const hostname = process.argv[2] || 'https://example.com';
//////**EXCLUDED PATHS**//////
const excludePaths = ['icons', 'textures'];
//////**EXCLUDED PATHS**//////

const imagePaths = glob
	.sync('./public/images/**/*.{jpg,jpeg,png}')
	.filter((imgPath) => !excludePaths.some((path) => imgPath.includes(path)))
	.map((imgPath) => path.relative('./public', imgPath));

// An array with links
const links = imagePaths.map((imgPath) => {
	return {
		url: '/' + imgPath,
		changefreq: 'daily',
		priority: 0.5,
		img: [
			{
				url: hostname + '/' + imgPath,
			},
		],
	};
});

if (links.length > 0) {
	// Create a stream to write to
	const stream = new SitemapStream({ hostname: hostname });

	// Return a promise that resolves with XML string
	streamToPromise(Readable.from(links).pipe(stream))
		.then((data) => {
			fs.writeFileSync('./public/sitemap.xml', data.toString());
			console.log('Sitemap success!');
		})
		.catch((error) => {
			console.error('Error generating sitemap:', error);
		});
} else {
	console.error('Error: no images found in the /public/images folder!');
}
