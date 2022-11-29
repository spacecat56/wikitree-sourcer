const path = require('path');

// build module command: npm run build
module.exports = {
  mode: 'development',
    entry: './app/extract_citation.js',
  /*resolve: {
	  alias: {
		  './base/browser/common/browser_compat.mjs': path.resolve(__dirname, '.extension/base/browser/common/browser_compat.mjs'),
	  }
  },*/
	resolve: {
 		alias: {
		 "/base/browser": path.resolve(__dirname, "extension/base/browser"),
		}
	},
  devtool: 'eval-source-map',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'CitationExtractor',
      type: 'umd',
      umdNamedDefine: true,
    },
  },
};
