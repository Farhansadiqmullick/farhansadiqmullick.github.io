/*
	Replaces jquery.scrolly. Native smooth scrolling covers every browser we care
	about, and reduced-motion users get an instant jump instead.
*/
export function initSmoothScroll() {
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)"
	);

	document.querySelectorAll("a.scrolly").forEach((link) => {
		link.addEventListener("click", (event) => {
			const href = link.getAttribute("href");

			if (!href || !href.startsWith("#")) return;

			const target = document.querySelector(href);

			if (!target) return;

			event.preventDefault();

			target.scrollIntoView({
				behavior: prefersReducedMotion.matches ? "auto" : "smooth",
				block: "start"
			});

			// Keep the URL in step without triggering a second jump.
			history.replaceState(null, "", href);
		});
	});
}
