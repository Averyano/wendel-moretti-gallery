// loaders/pathResolverLoader.js
const path = require('path');

module.exports = function (source) {
	const options = this.getOptions();

	// Calculate the relative path from the current file to the target directory
	const relativePath = path.relative(
		path.dirname(this.resourcePath), // Current file's directory
		path.resolve(__dirname, options.targetDirectory) // Target directory
	);

	// Ensure path separators are correct, especially for Windows environments
	const normalizedPath = relativePath.replace(/\\/g, '/');

	// Construct a dynamic regex using the placeholder from options
	const regex = new RegExp(`${options.placeholder}/`, 'g');

	// Replace placeholder with the calculated relative path
	const result = source.replace(regex, `${normalizedPath}/`);
	return result;
};
