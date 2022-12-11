const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const portFinderSync = require("portfinder-sync");
const tailwindScrollbar = require("tailwind-scrollbar");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const PORT = 3000;

module.exports = {
  mode: "development",
  entry: {
    content: path.resolve(__dirname, "./src/content/demo/index.jsx"),
    popup: path.resolve(__dirname, "./src/popup/index.jsx"),
  },
  watch: true,
  output: {
    path: path.resolve(__dirname, "content-dev"),
    filename: "[name].js",
  },
  devtool: "source-map",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    extensions: ["*", ".ts", ".tsx", ".jsx", ".js", ".json", "svg"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve("babel-loader"),
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: [
                "@babel/plugin-transform-runtime",
                require.resolve("react-refresh/babel"),
                ["@babel/plugin-proposal-decorators", { legacy: true }],
              ].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.(css|less)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { importLoaders: 1 },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                ident: "postcss",
                plugins: [tailwindcss, autoprefixer],
              },
            },
          },
          "less-loader",
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/content/demo/index.html",
      filename: "content.html",
      inject: "head",
      hash: false,
      chunks: ["content"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/popup/index.html",
      filename: "popup.html",
      inject: "head",
      hash: false,
      chunks: ["popup"],
    }),
    new webpack.DefinePlugin({
      "process.env": {
        MODE: JSON.stringify(process.env.MODE),
      },
    }),
    new ReactRefreshWebpackPlugin(),
    tailwindScrollbar,
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
  ],
  devServer: {
    hot: true,
    open: false,
    port: portFinderSync.getPort(PORT),
    historyApiFallback: true,
    devMiddleware: {
      writeToDisk: true,
    },
  },
};
