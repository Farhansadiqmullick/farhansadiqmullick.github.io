import emailjs from "@emailjs/browser";

/*
	All four values are compiled in from .env by webpack's DefinePlugin. They are
	public credentials by design — the Turnstile sitekey is meant to appear in page
	source, and the EmailJS public key only works from allowed origins.
*/
const TURNSTILE_SITEKEY = process.env.TURNSTILE_SITEKEY;
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;

/*
	Optional. Point this at server/index.js (which holds the Elastic Email key) and
	the form posts there instead, so the token gets verified before any mail goes
	out. Left blank, the form falls back to EmailJS exactly as before.
*/
const CONTACT_ENDPOINT = process.env.CONTACT_ENDPOINT;

const EMAIL_PATTERN = /^[\w.+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export function initContactForm() {
	const form = document.querySelector("#contact-form");

	if (!form) return;

	const submit = form.querySelector("input[type='submit']");
	const status = form.querySelector("#form-status");
	const widget = form.querySelector(".cf-turnstile");

	let turnstileToken = "";

	emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

	// Nothing can be sent until the challenge is solved.
	setEnabled(submit, false);

	window.onloadTurnstileCallback = function () {
		if (!widget || !TURNSTILE_SITEKEY) return;

		window.turnstile.render(widget, {
			sitekey: TURNSTILE_SITEKEY,
			callback(token) {
				turnstileToken = token;
				setEnabled(submit, true);
			},
			"expired-callback"() {
				turnstileToken = "";
				setEnabled(submit, false);
				report(status, "Verification expired — please tick the box again.", "error");
			},
			"error-callback"() {
				turnstileToken = "";
				setEnabled(submit, false);
			}
		});
	};

	// Turnstile may already have loaded and fired before this module ran.
	if (window.turnstile) window.onloadTurnstileCallback();

	form.addEventListener("submit", async (event) => {
		event.preventDefault();

		const name = form.elements.name.value.trim();
		const email = form.elements.email.value.trim();
		const message = form.elements.message.value.trim();

		const problem = validate({ name, email, message, turnstileToken });

		if (problem) return report(status, problem, "error");

		const original = submit.value;

		setEnabled(submit, false);
		submit.value = "Sending...";
		report(status, "Sending your message...", "pending");

		try {
			if (CONTACT_ENDPOINT)
				await sendViaServer({ name, email, message, turnstileToken });
			else await sendViaEmailJS({ name, email, message });

			form.reset();
			report(status, "Thanks — your message is on its way.", "success");
		} catch (error) {
			console.error(error);
			report(status, "Sorry, that didn't send. Please try again.", "error");
		} finally {
			submit.value = original;

			// A Turnstile token is single-use, so make the visitor solve a fresh one.
			turnstileToken = "";
			if (window.turnstile) window.turnstile.reset(widget);
		}
	});
}

function validate({ name, email, message, turnstileToken }) {
	if (name.length < 3) return "Please enter your name.";
	if (!EMAIL_PATTERN.test(email)) return "Please enter a valid email address.";
	if (message.length < 20)
		return "Please write a little more so I know how I can help.";
	if (!turnstileToken) return "Please complete the verification box first.";

	return null;
}

async function sendViaServer(payload) {
	const response = await fetch(CONTACT_ENDPOINT, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload)
	});

	if (!response.ok) throw new Error(`Contact endpoint returned ${response.status}`);

	return response.json();
}

async function sendViaEmailJS({ name, email, message }) {
	return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
		name,
		email,
		message
	});
}

function setEnabled(submit, enabled) {
	submit.disabled = !enabled;
	submit.style.opacity = enabled ? 1 : 0.5;
	submit.style.pointerEvents = enabled ? "auto" : "none";
}

function report(status, text, state) {
	if (!status) return;

	status.textContent = text;
	status.dataset.state = state;
}
