/*
	Optional contact endpoint.

	ELASTIC_EMAIL_API_KEY can send mail as you, so it must never reach the browser.
	webpack.config.js refuses to bundle it; this process reads it at runtime instead.
	GitHub Pages only serves static files, so run this somewhere that executes Node
	(Render, Railway, Fly, a VPS) and set CONTACT_ENDPOINT in .env to its public URL
	before running `npm run build`.

	Leave CONTACT_ENDPOINT empty and the site keeps using EmailJS — this file is then
	simply unused.

	Runs on Node's built-in http and fetch, so it needs no extra dependencies.
*/
const http = require("http");

require("dotenv").config();

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ELASTIC_EMAIL_API_KEY;
const FROM = process.env.ELASTIC_FROM_EMAIL;
const TO = process.env.ELASTIC_TO_EMAIL;
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

// Restrict to the sites allowed to post here.
const ALLOWED_ORIGINS = [
	"https://farhanmullick.com",
	"https://www.farhanmullick.com",
	"http://localhost:8080"
];

if (!API_KEY || !FROM || !TO) {
	console.error(
		"Missing ELASTIC_EMAIL_API_KEY, ELASTIC_FROM_EMAIL or ELASTIC_TO_EMAIL in .env"
	);
	process.exit(1);
}

const server = http.createServer(async (req, res) => {
	const origin = req.headers.origin;

	if (ALLOWED_ORIGINS.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
		res.setHeader("Access-Control-Allow-Headers", "Content-Type");
		res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
	}

	if (req.method === "OPTIONS") return end(res, 204, null);

	if (req.method !== "POST" || req.url !== "/api/contact")
		return end(res, 404, { error: "Not found" });

	try {
		const body = await readJson(req);
		const problem = validate(body);

		if (problem) return end(res, 400, { error: problem });

		/*
			Verifying the Turnstile token server-side is the whole reason this endpoint
			exists — a browser-only check proves nothing, since anyone can POST directly.
		*/
		if (TURNSTILE_SECRET && !(await verifyTurnstile(body.turnstileToken)))
			return end(res, 403, { error: "Verification failed" });

		await sendMail(body);

		return end(res, 200, { ok: true });
	} catch (error) {
		if (error.statusCode === 400) return end(res, 400, { error: error.message });

		console.error(error);
		return end(res, 500, { error: "Could not send message" });
	}
});

server.listen(PORT, () => console.log(`Contact endpoint listening on :${PORT}`));

function readJson(req) {
	return new Promise((resolve, reject) => {
		let raw = "";

		req.on("data", (chunk) => {
			raw += chunk;

			// Nothing legitimate reaches 100KB; drop anything that tries.
			if (raw.length > 100_000) {
				req.destroy();
				reject(new Error("Payload too large"));
			}
		});

		req.on("end", () => {
			try {
				resolve(JSON.parse(raw));
			} catch {
				// Unparseable body is the caller's fault, so flag it as a 400.
				const error = new Error("Invalid JSON body");
				error.statusCode = 400;
				reject(error);
			}
		});

		req.on("error", reject);
	});
}

function validate(body = {}) {
	const name = String(body.name || "").trim();
	const email = String(body.email || "").trim();
	const message = String(body.message || "").trim();

	if (name.length < 3) return "Name is required";
	if (!/^[\w.+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email))
		return "Valid email is required";
	if (message.length < 20) return "Message is too short";

	return null;
}

async function verifyTurnstile(token) {
	const response = await fetch(
		"https://challenges.cloudflare.com/turnstile/v0/siteverify",
		{
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				secret: TURNSTILE_SECRET,
				response: token || ""
			})
		}
	);

	const result = await response.json();

	return result.success === true;
}

async function sendMail({ name, email, message }) {
	const response = await fetch("https://api.elasticemail.com/v4/emails/transactional", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-ElasticEmail-ApiKey": API_KEY
		},
		body: JSON.stringify({
			Recipients: { To: [TO] },
			Content: {
				From: FROM,
				ReplyTo: email,
				Subject: `Portfolio contact from ${name}`,
				Body: [
					{
						ContentType: "HTML",
						Content: `<p><strong>Name:</strong> ${escapeHtml(name)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<p><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`
					}
				]
			}
		})
	});

	if (!response.ok)
		throw new Error(`Elastic Email responded ${response.status}: ${await response.text()}`);

	return response.json();
}

// Visitor input lands in an HTML email body, so escape it before it goes out.
function escapeHtml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function end(res, status, payload) {
	res.writeHead(status, { "Content-Type": "application/json" });
	res.end(payload === null ? "" : JSON.stringify(payload));
}
