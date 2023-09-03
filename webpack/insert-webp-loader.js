module.exports = function (source) {
	return source.replace(
		/<img([^>]+)src\s*=\s*(['"])(.+?)\2/gi,
		function (match, attrs, quote, src) {
			let webpSrc = src.replace(/\.(png|jpe?g)$/i, '.webp');
			return `<img${attrs}src=${quote}${src}${quote} data-pre-webp=${quote}${webpSrc}${quote}`;
		}
	);
};
