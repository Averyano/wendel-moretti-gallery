export default class Router {
	constructor(loader) {
		this.loader = loader;
	}

	removeContentFromDOM() {
		this.loader.content.remove();
	}

	addContentToDOM(newPage) {
		this.loader.content = newPage.content;
		this.loader.wrapper.setAttribute('data-page', this.loader.template);
		this.loader.wrapper.appendChild(newPage.content);
	}

	destroyCurrentPage() {
		// Clears event listeners
		this.loader.current.page.removeEventListeners();
		this.loader.current.page.destroy();
		this.loader.removeLinkListeners();
	}

	createNewPage(html) {
		const newPage = document.createElement('div');
		newPage.innerHTML = html;

		const newPageContent = newPage.querySelector('.content');
		const newPageTemplate = newPageContent.getAttribute('data-template');
		const newPageImages = newPageContent.querySelectorAll('[data-pre]');

		return {
			page: newPage,
			content: newPageContent,
			template: newPageTemplate,
			images: newPageImages,
		};
	}

	async navigate({ url, request, cachedHtml, push = true }) {
		if (!request & !cachedHtml)
			return console.error('Critical Error! No request or cache attached.');

		this.loader.onLeave(); // ⚠ onLeave

		// Clears event listeners
		this.loader.current.page.removeEventListeners();
		this.loader.current.page.destroy();
		this.loader.removeLinkListeners();

		let html;

		if (cachedHtml) {
			html = cachedHtml;
		} else if (request) {
			html = await request.text();
		}

		// Creating new page
		const newPage = document.createElement('div');
		newPage.innerHTML = html;

		if (push) {
			window.history.pushState({}, '', url);
		}

		const newPageContent = newPage.querySelector('.content');
		const newPageTemplate = newPageContent.getAttribute('data-template');
		const newPageImages = newPageContent.querySelectorAll('[data-pre]');

		this.loader.preloader.selectorChildren = {
			images: newPageImages,
		};

		this.loader.content.remove(); // Delete old page from the DOM

		this.loader.beforeEnter(); // ⚠ beforeEnter

		this.loader.content = newPageContent;
		this.loader.template = newPageContent.getAttribute('data-template');

		this.loader.wrapper.setAttribute('data-page', this.loader.template);

		this.loader.wrapper.appendChild(newPageContent); // Add new page to the DOM

		this.loader.onEnter(); // ⚠ onEnter

		// Creates the preloader
		// this.loader.preloader.createComponent();

		// Creates the page
		this.loader.current = this.loader.pickPage(url);

		this.loader.addLinkListeners();

		this.loader.afterEnter(); // ⚠ afterEnter
		this.loader.preloader.createLoader(newPageTemplate);
	}
}
