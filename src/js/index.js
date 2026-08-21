import "../css/lightbox.css";

import { initPreload } from "./preload";
import { initSmoothScroll } from "./smooth-scroll";
import { initHeader } from "./header";
import { initSectionBackgrounds } from "./section-bg";
import { initLightbox } from "./lightbox";
import { initContactForm } from "./contact-form";

/*
	Turnstile calls window.onloadTurnstileCallback, so the form has to register that
	handler before the Cloudflare script finishes loading. Everything here runs on
	DOMContentLoaded, ahead of the deferred Turnstile bundle.
*/
function start() {
	initPreload();
	initSmoothScroll();
	initHeader();
	initSectionBackgrounds();
	initLightbox();
	initContactForm();
}

if (document.readyState === "loading")
	document.addEventListener("DOMContentLoaded", start);
else start();
