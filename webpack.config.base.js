const path = require('path');

// const BundleAnalyzerPlugin =
// 	require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

// General Webpack plugin
const webpack = require('webpack');
const ImageminWebpWebpackPlugin = require('imagemin-webp-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Compression for Prod
const CompressionPlugin = require('compression-webpack-plugin');

// Folders
const dirApp = path.join(__dirname, 'app');
const dirShared = path.join(__dirname, 'shared');
const dirStyles = path.join(__dirname, 'styles');
const dirNode = 'node_modules';

// Assets
function addForCopy(dir, customFolder) {
	const folder = customFolder ? customFolder : dir;
	return { from: dir, to: './' + folder };
}
const assetsToCopy = [
	addForCopy(path.join(dirShared, 'images')), // folder: /images
	addForCopy(path.join(dirShared, 'pdf')), // folder: /pdf
	addForCopy(path.join(dirShared, 'models')), // folder: /models

	addForCopy(path.join(dirShared, 'other'), false), // folder: /
	addForCopy(path.join(dirShared, 'images', 'icons'), 'icons'), // folder: /icons
];

// Generate static HTML pages
const { getPagesHtmlPlugins } = require('./webpack.pages.routes');
const dataJson = require('./data/home.json');

const pagePlugins = getPagesHtmlPlugins({
	index: 'home',
	data: dataJson,
	methods: {
		webpSrc: function (src) {
			return src.replace(/\.(png|jpe?g)$/i, '.webp');
		},
	},
});

// const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
const baseConfig = (isDevelopment) => {
	/**
	 * Plugins
	 */

	const plugins = [
		new webpack.DefinePlugin({
			IS_DEVELOPMENT: isDevelopment,
		}),
		new CopyWebpackPlugin({
			patterns: assetsToCopy,
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[id].css',
		}),
		new CleanWebpackPlugin(),

		...pagePlugins,
	];

	// Compress for PRODUCTION
	if (!isDevelopment) {
		plugins.push(
			new ImageminWebpWebpackPlugin({
				config: [
					{
						test: /\.(jpe?g|png)/,
						options: {
							quality: 100,
						},
					},
				],
				overrideExtension: true,
				detailedLogs: false,
				silent: false,
				strict: true,
			}),
			new CompressionPlugin({
				algorithm: 'gzip',
				test: /\.(js|css|html|svg)$/,
				threshold: 10240,
				minRatio: 0.8,
			}),
			new CompressionPlugin({
				algorithm: 'brotliCompress',
				test: /\.(js|css|html|svg)$/,
				compressionOptions: {
					level: 11,
				},
				threshold: 10240,
				minRatio: 0.8,
			})
		);
	}

	/**
	 * Base Build
	 */
	return {
		// cache: true,

		resolve: {
			alias: {
				Utils: path.resolve(__dirname, 'app/utils/'),
				Images: path.resolve(__dirname, 'shared/images/'),
			},
			modules: [dirShared, dirNode],
		},

		entry: [path.join(dirApp, 'app.js'), path.join(dirStyles, 'index.scss')],

		output: {
			path: path.join(__dirname, 'public'),
			filename: '[name][contenthash].js',
			assetModuleFilename: '[name][ext]',
			publicPath: '/',
		},

		plugins: plugins,

		module: {
			rules: [
				{
					test: /\.scss$/,
					use: [
						{
							loader: MiniCssExtractPlugin.loader,
							options: {
								publicPath: '',
							},
						},
						{
							loader: 'css-loader',
						},
						{
							loader: 'postcss-loader',
							options: {
								postcssOptions: {
									plugins: [
										['postcss-preset-env', {}],
										['autoprefixer', {}],
									],
								},
							},
						},
						{
							loader: 'sass-loader',
						},
					],
				},
				{
					test: /\.(glsl|vs|fs|vert|frag)$/,
					exclude: /node_modules/,
					use: ['raw-loader'],
				},
				{
					test: /\.js$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env'],
						},
					},
				},
				{
					test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
					type: 'asset/resource',
					generator: {
						filename: 'images/[name][ext]',
					},
				},
				{
					test: /\.(glb|gltf)$/i,
					type: 'asset/resource',
					generator: {
						filename: 'models/[name][ext]',
					},
				},
				{
					test: /\.(woff|woff2|ttf|otf)$/i,
					type: 'asset/resource',
					generator: {
						filename: 'fonts/[name][ext]',
					},
				},
				{
					test: /\.svg$/,
					type: 'asset/inline',
					resourceQuery: /inline/, // Inline assets with the "inline" query parameter.
				},
				{
					test: /\.json$/,
					type: 'asset/resource',
					generator: {
						filename: '[name][ext][query]',
					},
				},
				{
					test: /\.pug$/,
					use: [
						{
							loader: path.resolve(
								__dirname,
								'./webpack/loaders/path-resolver.js'
							),
							options: {
								targetDirectory: path.resolve(__dirname, 'shared/images'),
								placeholder: '@images',
							},
						},
						{
							loader: 'html-loader',
							options: {
								sources: {
									list: [
										{
											tag: 'img',
											attribute: 'src',
											type: 'src',
										},
										{
											tag: 'img',
											attribute: 'data-pre',
											type: 'src',
										},
										{
											tag: 'img',
											attribute: 'data-pre-webp',
											type: 'src',
										},
									],
								},
							},
						},
						{
							loader: '@webdiscus/pug-loader',
							options: {
								method: 'render', // use this method to render into static HTML
							},
						},
					],
				},
			],
		},
	};
};

module.exports = baseConfig;
