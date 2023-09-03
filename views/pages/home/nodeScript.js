const fs = require('fs');
const path = require('path');

// Read the Pug file
let pugFile = fs.readFileSync('./coverGallery.pug', 'utf8');

// Use a regular expression to match all coverImg calls
const regex = /\+coverImg\("(.+?)", '(.+?)'\)/g;

// Replace each match with a version that includes alt text
pugFile = pugFile.replace(regex, (match, src, propClass) => {
	// Extract the base name of the image file, replace dashes with spaces, and remove the extension
	let baseName = path.basename(src, path.extname(src)).replace(/-/g, ' ');

	// Remove leading numbers and dash
	baseName = baseName.replace(/^\d+-/, '');

	return `+coverImg("${src}", '${propClass}', '${baseName}')`;
});

// Write the updated Pug file
fs.writeFileSync('./coverGallery.pug', pugFile);
