const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { StatsWriterPlugin } = require("webpack-stats-plugin");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";
  const buildPath = path.resolve(__dirname, "build", isProduction ? "release" : "debug");

  return {
    mode: isProduction ? "production" : "development",
    entry: "./init.js",
    output: {
      path: buildPath,
      filename: "bundle.js",
      clean: true,
    },
    optimization: {
      splitChunks: false, // fully disables chunk splitting
      runtimeChunk: false, // disables runtime chunk
      minimize: isProduction,
    },
    devtool: isProduction ? "source-map" : "eval-source-map",
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : "style-loader",
            "css-loader",
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "./index.ejs",
        filename: "index.html",
        inject: false,
        minify: isProduction
          ? {
              removeComments: true,
              collapseWhitespace: true,
            }
          : false,
      }),
      ...(isProduction
        ? [
            new MiniCssExtractPlugin({
              filename: "styles.css", // single output file
            }),
          ]
        : []),
      ...(!isProduction
        ? [
            new StatsWriterPlugin({
              stats: {
                all: true, // Or specific fields like 'assets', 'chunks', 'modules'
              },
              filename: "stats.json",
            }),
          ]
        : []),
    ],
    devServer: {
      static: {
        directory: buildPath,
      },
      compress: true,
      port: 3000,
      hot: true,
      open: true,
    },
  };
};
