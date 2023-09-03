const { getWebpackDevRoutes } = require('./webpack.pages.routes');
const ImageminWebpWebpackPlugin = require('imagemin-webp-webpack-plugin');

const path = require('path');
const webpackPageRoutes = getWebpackDevRoutes({ indexFolder: 'home' });

module.exports = {
	mode: 'development',

	devtool: 'inline-source-map',

	devServer: {
		// headers: {
		// 	'Cache-Control': 'public, max-age=31536000',
		// },
		static: {
			directory: path.join(__dirname, 'public'),
		},
		port: 3000,
		open: false,
		hot: true,
		compress: true,
		historyApiFallback: webpackPageRoutes.rewrites,
	},
	// optimization: {
	// 	minimize: true,
	// 	minimizer: [new ImageminWebpWebpackPlugin()],
	// },
};
