const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');
const devConfig = require('./webpack.config.development.js');
const prodConfig = require('./webpack.config.build.js');
const colors = require('colors/safe');
require('dotenv').config();

module.exports = (env, argv) => {
	const isDevelopment = argv.mode === 'development';
	const isWebp = process.env.IS_WEBP == 'true';
	console.log(
		`.webp: ${isWebp ? colors.green('enabled') : colors.red('disabled')}`
	);

	if (isDevelopment) {
		return merge(baseConfig(isDevelopment, isWebp), devConfig);
	} else {
		return merge(baseConfig(isDevelopment, isWebp), prodConfig);
	}
};
