const webpack = require('webpack');

class InsertConsoleLogPlugin {
	constructor(options) {
		this.options = options;
	}

	apply(compiler) {
		compiler.hooks.compilation.tap('InsertConsoleLogPlugin', (compilation) => {
			compilation.hooks.processAssets.tap(
				{
					name: 'InsertConsoleLogPlugin',
					stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
				},
				() => {
					Object.keys(compilation.assets).forEach((asset) => {
						let source = compilation.assets[asset].source();
						if (this.options.assetName.test(asset)) {
							if (this.options.log.length === 0) return;
							this.options.log.forEach((log) => {
								source = source + `\nconsole.log("${log}")`;
							});

							compilation.updateAsset(
								asset,
								new webpack.sources.RawSource(source)
							);
						}
					});
				}
			);
		});
	}
}

module.exports = InsertConsoleLogPlugin;
