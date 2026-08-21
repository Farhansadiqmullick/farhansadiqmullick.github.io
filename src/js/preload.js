/*
	Drops the is-preload class once the page has settled, which lets main.css turn
	transitions back on. A timeout backs it up so a slow or failed asset can never
	leave the spinner running forever.
*/
export function initPreload() {
	const clear = () => document.documentElement.classList.remove("is-preload");

	if (document.readyState === "complete") window.setTimeout(clear, 100);
	else window.addEventListener("load", () => window.setTimeout(clear, 100));

	window.setTimeout(clear, 4000);
}
