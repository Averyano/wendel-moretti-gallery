/**
 * @description This file contains functions to generate html-webpack-plugin instances for each page in the pages directory
 * @param {string} indexFolder - The folder name of the index page. Defaults to the first folder in the pages directory
 * @param {string} directory - The directory of the pages. Defaults to the views/pages directory in the root of the project
 * @param {object} methods - The methods to be passed to the pug templates
 * @param {object} data - The data to be passed to the pug templates (JSON)
 */

const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
// const PugPlugin = require('pug-plugin');

module.exports.getPagesHtmlPlugins = ({
	indexFolder,
	methods,
	data,
	directory,
}) => {
	const pagesDirectory = directory || path.join(__dirname, 'views', 'pages');

	// Function to check if the path is a directory
	function isDirectory(source) {
		return fs.lstatSync(source).isDirectory();
	}

	// Get all folders inside the pages directory
	const getDirectories = (source) =>
		fs
			.readdirSync(source)
			.filter((name) => isDirectory(path.join(source, name)));

	const folders = getDirectories(pagesDirectory);

	// Check for the presence of index.pug in each folder
	const pagePlugins = [];

	folders.forEach((folder) => {
		const indexPath = path.join(pagesDirectory, folder, 'index.pug');
		if (fs.existsSync(indexPath)) {
			const htmlPlugin = new HtmlWebpackPlugin({
				template: path.join(pagesDirectory, folder, 'index.pug'),
				filename: `${folder}.html`,
				methods: methods,
				data: data,
				minify: {
					collapseWhitespace: true,
					keepClosingSlash: true,
					removeComments: true,
					removeRedundantAttributes: false,
					removeScriptTypeAttributes: true,
					removeStyleLinkTypeAttributes: true,
					useShortDoctype: true,
				},
			});

			pagePlugins.push(htmlPlugin);
		} else {
			console.log(`index.pug does not exist in ${folder}`);
		}
	});

	// Also add the index.html
	let indexFolderToBuild = indexFolder || folders[0];

	const indexHtmlPlugin = new HtmlWebpackPlugin({
		template: path.join(pagesDirectory, indexFolderToBuild, 'index.pug'),
		filename: `index.html`,
		methods: methods,
		data: data,
		minify: {
			collapseWhitespace: true,
			keepClosingSlash: true,
			removeComments: true,
			removeRedundantAttributes: false,
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true,
			useShortDoctype: true,
		},
	});

	pagePlugins.push(indexHtmlPlugin);

	if (pagePlugins.length > 0) {
		return pagePlugins;
	} else {
		return [];
	}
};

module.exports.getWebpackDevRoutes = ({ indexFolder, directory }) => {
	let webpackDevRoutes = {
		rewrites: [],
	};

	const pagesDirectory = directory || path.join(__dirname, 'views', 'pages');

	// Function to check if the path is a directory
	function isDirectory(source) {
		return fs.lstatSync(source).isDirectory();
	}

	// Get all folders inside the pages directory
	const getDirectories = (source) =>
		fs
			.readdirSync(source)
			.filter((name) => isDirectory(path.join(source, name)));

	const folders = getDirectories(pagesDirectory);

	folders.forEach((folder) => {
		const indexPath = path.join(pagesDirectory, folder, 'index.pug');
		if (fs.existsSync(indexPath)) {
			webpackDevRoutes.rewrites.push({
				from: `/${folder}`,
				to: `/${folder}.html`,
			});
		} else {
			console.log(`index.pug does not exist in ${folder}`);
		}
	});

	let indexFolderToBuild = indexFolder || folders[0];

	// Also add the index.html route
	webpackDevRoutes.rewrites.push({
		from: `/${indexFolderToBuild}`,
		to: `/index.html`,
	});

	console.log(webpackDevRoutes);

	if (webpackDevRoutes.length > 0) {
		return webpackDevRoutes;
	} else {
		return [];
	}
};
