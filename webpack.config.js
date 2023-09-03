const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.base.js');
const devConfig = require('./webpack.config.development.js');
const prodConfig = require('./webpack.config.build.js');

module.exports = (env, argv) => {
	const isDevelopment = argv.mode === 'development';

	if (isDevelopment) {
		return merge(baseConfig(isDevelopment), devConfig);
	} else {
		return merge(baseConfig(isDevelopment), prodConfig);
	}
};
