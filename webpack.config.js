const path = require("path");
const { title } = require("process");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const nodeExternals = require('webpack-node-externals');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  entry: "./index.js", // Entry point for your app
  target: "node", // Target Node.js runtime
  output: {
    filename: "bundle.js", // Consolidated output file
    path: path.resolve(__dirname, "dist"),
  },
  mode: "production", // Enable optimizations
  optimization: {
    minimize: true, // Minify the output
  },
  externalsPresets: { node : true },
  // externals: [
  //  nodeExternals({
  //    allowlist: ["cheerio"],
  //  })
  // ],
  resolve: {
    extensions: ['.js', '.json'], // Ensure it resolves .js and .json files
    modules: [path.resolve(__dirname, 'node_modules'), 'node_modules'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: "htmltb-csv",
      meta: {
        author: "Tom. M.",
        version: "0.1.1"
      }
    }),
    new BundleAnalyzerPlugin(),
  ]
};