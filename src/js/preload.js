/*
	Drops the is-preload class, which lets main.css turn transitions back on and
	pull the spinner overlay off the page.

	This used to wait for window.load — i.e. every image, every webfont and the
	YouTube iframe — so the spinner stayed up long after the page was readable.
	Stylesheets are render-blocking, so by the time this runs the layout has
	already settled; a couple of frames is enough to avoid the intro transitions
	firing mid-parse.
*/
export function initPreload() {
	const clear = () => document.documentElement.classList.remove("is-preload");

	window.requestAnimationFrame(() => window.requestAnimationFrame(clear));

	// rAF never fires in a background tab, so back it up on a timer.
	window.setTimeout(clear, 1000);
}
