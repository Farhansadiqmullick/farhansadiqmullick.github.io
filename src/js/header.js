/*
	Replaces the jquery.scrollex + breakpoints.js half of main.js.

	Two behaviours, both lifted from the original:
	  - above the medium breakpoint the title is pinned to the middle of the screen
	  - the title fades out as the header scrolls past
*/
const MEDIUM_UP = "(min-width: 981px)";

export function initHeader() {
	const header = document.querySelector("#header");

	if (!header) return;

	const title = header.querySelector("header");

	if (!title) return;

	pinTitle(title);
	fadeTitle(header, title);
}

function pinTitle(title) {
	const query = window.matchMedia(MEDIUM_UP);

	const apply = () => {
		if (query.matches) {
			title.style.position = "fixed";
			title.style.height = "auto";
			title.style.top = "50%";
			title.style.left = "0";
			title.style.width = "100%";
			title.style.marginTop = `${title.offsetHeight / -2}px`;
		} else {
			title.style.position = "";
			title.style.height = "";
			title.style.top = "";
			title.style.left = "";
			title.style.width = "";
			title.style.marginTop = "";
		}
	};

	apply();
	query.addEventListener("change", apply);

	// The pin offset depends on the rendered height, so recheck once webfonts land.
	window.addEventListener("load", apply);
	window.addEventListener("resize", apply);
}

function fadeTitle(header, title) {
	// Below the small breakpoint the original detached this handler entirely.
	const query = window.matchMedia("(min-width: 737px)");
	let ticking = false;

	const update = () => {
		ticking = false;

		if (!query.matches) {
			title.style.opacity = "";
			return;
		}

		const viewport = window.innerHeight;
		const top = header.getBoundingClientRect().top + window.scrollY;
		const travel = viewport + header.offsetHeight;

		/*
			Same 0..1 sweep scrollex produced: 0 just before the section enters the
			viewport, 1 once it has fully left. At rest on a full-height header this
			sits at 0.5, which is where the title reads at full opacity.
		*/
		const progress = (viewport + window.scrollY - top) / travel;
		const ramp = progress > 0.5 ? 1 - progress : progress;

		title.style.opacity = Math.max(0, Math.min(1, ramp * 2));
	};

	const onScroll = () => {
		if (ticking) return;
		ticking = true;
		window.requestAnimationFrame(update);
	};

	window.addEventListener("scroll", onScroll, { passive: true });
	window.addEventListener("resize", onScroll);
	query.addEventListener("change", update);
	update();
}
