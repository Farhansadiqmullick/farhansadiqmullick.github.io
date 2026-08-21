/*
	Replaces magnific-popup (1859 lines of plugin + two stylesheets) for the one
	thing this site asked of it: click a portfolio thumbnail, show the full shot
	with a caption link underneath.

	Captions come from the title attribute in index.html and are authored in this
	repo, so they are injected as HTML on purpose — that is what carries the link
	through to the site being credited.
*/
export function initLightbox(selector = ".image-popup-no-margins") {
	const triggers = Array.from(document.querySelectorAll(selector));

	if (triggers.length === 0) return;

	const overlay = buildOverlay();
	const figure = overlay.querySelector(".lightbox__figure");
	const image = overlay.querySelector(".lightbox__image");
	const caption = overlay.querySelector(".lightbox__caption");
	const closeButton = overlay.querySelector(".lightbox__close");

	let lastFocused = null;

	function open(trigger) {
		lastFocused = trigger;

		image.src = trigger.getAttribute("href");
		image.alt = trigger.querySelector("img")?.alt || "";
		caption.innerHTML = trigger.dataset.caption || "";
		caption.hidden = caption.innerHTML.trim() === "";

		overlay.hidden = false;
		// Let the browser paint the hidden state first so the fade actually runs.
		requestAnimationFrame(() => overlay.classList.add("is-open"));

		document.body.style.overflow = "hidden";
		closeButton.focus();
	}

	function close() {
		overlay.classList.remove("is-open");
		document.body.style.overflow = "";

		const finish = () => {
			overlay.hidden = true;
			image.src = "";
		};

		overlay.addEventListener("transitionend", finish, { once: true });
		// transitionend never fires if the overlay was never painted, so back it up.
		window.setTimeout(finish, 400);

		lastFocused?.focus();
	}

	triggers.forEach((trigger) => {
		// The title attribute is our caption; move it off so it stops rendering as
		// a raw-markup tooltip on hover.
		trigger.dataset.caption = trigger.getAttribute("title") || "";
		trigger.removeAttribute("title");

		trigger.addEventListener("click", (event) => {
			event.preventDefault();
			open(trigger);
		});
	});

	closeButton.addEventListener("click", close);

	overlay.addEventListener("click", (event) => {
		// Clicking the backdrop or the image closes; clicking a caption link must not.
		if (event.target === overlay || event.target === image || event.target === figure)
			close();
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !overlay.hidden) close();
	});
}

function buildOverlay() {
	const overlay = document.createElement("div");

	overlay.className = "lightbox";
	overlay.hidden = true;
	overlay.setAttribute("role", "dialog");
	overlay.setAttribute("aria-modal", "true");
	overlay.setAttribute("aria-label", "Project screenshot");

	overlay.innerHTML = `
		<button type="button" class="lightbox__close" aria-label="Close">&times;</button>
		<div class="lightbox__figure">
			<img class="lightbox__image" src="" alt="" />
			<div class="lightbox__caption"></div>
		</div>
	`;

	document.body.appendChild(overlay);

	return overlay;
}
