import GSAP from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

export default class Reveal {
	constructor({
		element,
		color,
		duration,
		size,
		dir,
		delay,
		ease,
		markers,
		start,
		end,
		ScrollTriggerProp,
	}) {
		this.originalElement = element;

		// Init values
		this.duration = duration ?? 1.5;
		this.color = color ?? 'rgb(255,0,0)';
		this.size = size ?? '100%';
		this.direction = dir.toLowerCase() ?? 'y';
		this.delay = delay ?? 0;
		this.ease = ease ?? 'power4.easeOut';
		this.scrollTriggerProp = ScrollTriggerProp ?? null;

		this.triggerElement = this.originalElement.closest(
			'[data-reveal-container]'
		);

		this.createElement();
		this.createTimeline({ start, end, markers });
		this.animateIn();
	}

	createElement() {
		this.originalElement.style.position = 'relative';

		this.revealElement = document.createElement('div');

		this.revealElement.style.height = '100%';
		this.revealElement.style.width = '100%';
		this.revealElement.style.position = 'absolute';
		this.revealElement.style.transform = 'scaleY(1)';
		this.revealElement.style.transformOrigin = 'bottom';
		this.revealElement.style.top = 0;
		this.revealElement.style.left = 0;
		this.revealElement.style.background = this.color;

		this.originalElement.appendChild(this.revealElement);
		console.log(this.revealElement);
	}

	createTimeline({
		start = 'top+=20% bottom',
		end = 'bottom-=20% top',
		markers = false,
	}) {
		this.timeline = GSAP.timeline({
			scrollTrigger: this.scrollTriggerProp
				? this.scrollTriggerProp
				: {
						trigger: this.triggerElement,
						start: start,
						end: end,
						markers: markers,
						toggleActions: 'restart none none reverse',
				  },
		});
	}

	animateIn(target) {
		if (this.direction === 'x') {
			this.timeline.to(this.revealElement, {
				scaleX: 0,
				duration: this.duration,
				ease: this.ease,
				delay: this.delay,
				// onComplete: this.removeElement,
				// onCompleteParams: [this.revealElement],
			});
		}

		if (this.direction === 'y') {
			this.timeline.to(this.revealElement, {
				scaleY: 0,
				duration: this.duration,
				ease: this.ease,
				delay: this.delay,
			});
		}
	}

	// removeElement(target) {
	//   setTimeout(() => {
	//     target.parentNode.removeChild(target);
	//   }, 2000);
	// }
}
