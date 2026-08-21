const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");

require("dotenv").config();

/*
	Only these keys are allowed to reach the browser. Everything the bundle needs
	is public by design: a Turnstile sitekey and the EmailJS public credentials are
	meant to be readable in page source, so baking them in is safe.
*/
const PUBLIC_KEYS = [
	"TURNSTILE_SITEKEY",
	"EMAILJS_PUBLIC_KEY",
	"EMAILJS_SERVICE_ID",
	"EMAILJS_TEMPLATE_ID",
	"CONTACT_ENDPOINT"
];

/*
	These never get bundled. ELASTIC_EMAIL_API_KEY can send mail on your behalf, so
	inlining it would publish it to anyone who opens devtools. server/index.js reads
	it at runtime instead.
*/
const SECRET_KEYS = [
	"ELASTIC_EMAIL_API_KEY",
	"ELASTIC_FROM_EMAIL",
	"ELASTIC_TO_EMAIL",
	"ELASTIC_CONTACT_LIST",
	"PORT"
];

const leaked = PUBLIC_KEYS.filter((key) => SECRET_KEYS.includes(key));

if (leaked.length > 0)
	throw new Error(
		`Refusing to build: ${leaked.join(", ")} is a server-only secret and cannot be bundled into client JS.`
	);

const missing = PUBLIC_KEYS.filter((key) => !process.env[key]);

if (missing.length > 0)
	console.warn(
		`[build] warning: missing .env values for ${missing.join(", ")} — they will compile to empty strings.`
	);

const env = Object.fromEntries(
	PUBLIC_KEYS.map((key) => [
		`process.env.${key}`,
		JSON.stringify(process.env[key] || "")
	])
);

module.exports = {
	entry: "./src/js/index.js",
	output: {
		path: path.resolve(__dirname, "assets/dist"),
		filename: "bundle.js",
		clean: true
	},
	module: {
		rules: [
			{
				test: /\.css$/i,
				use: [MiniCssExtractPlugin.loader, "css-loader"]
			}
		]
	},
	plugins: [
		new webpack.DefinePlugin(env),
		new MiniCssExtractPlugin({ filename: "bundle.css" })
	],
	devtool: "source-map"
};
