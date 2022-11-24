const path = require('path');

// build module command: npm run build
module.exports = {
  mode: 'development',
  entry: './app/ancestry_cites.js',
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
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'AncestryCites',
      type: 'umd',
      umdNamedDefine: true,
    },
  },
};
