/*
	Replaces the second half of main.js: each .main section with a primary image
	gets a fixed background layer that fades in while that section owns the middle
	of the screen. scrollex's "middle" mode becomes an IntersectionObserver whose
	root is squeezed down to a band across the viewport centre.
*/
const OVERLAY = "images/overlay.png";

export function initSectionBackgrounds() {
	const sections = document.querySelectorAll(".main");

	if (sections.length === 0) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				entry.target.__bg.classList.toggle("active", entry.isIntersecting);
			});
		},
		{ rootMargin: "-45% 0px -45% 0px", threshold: 0 }
	);

	sections.forEach((section) => {
		const image = section.querySelector(".image.primary img");

		if (!image) return;

		/*
			data-bg points at a WebP sized for a full-viewport cover. The <img> itself
			is display:none up here and lazy, so its own src may never be fetched —
			reading it would leave the layer blank.
		*/
		const source = image.dataset.bg || image.getAttribute("src");

		const bg = document.createElement("div");

		bg.className = "main-bg";
		bg.id = `${section.id}-bg`;
		bg.style.backgroundImage = `url("${OVERLAY}"), url("${source}")`;

		document.body.appendChild(bg);

		section.__bg = bg;
		observer.observe(section);
	});
}
