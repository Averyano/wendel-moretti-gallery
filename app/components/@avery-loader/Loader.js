import GlobalHandler from '../../classes/GlobalHandler';
import NodeEmitter from '../../classes/NodeEmitter';

import each from 'lodash/each';

import Preloader from './Preloader';
import Router from './CustomRouter';

import { htmlWithoutPin, getPathFromURL } from './utils';
import { EventEmitter } from 'events';
// pages = [{ page: this.home, url: ['/', '/home'] }];
export default class Loader extends EventEmitter {
	constructor({
		pages,
		canvas,
		preloader,
		onLeave,
		onEnter,
		beforeEnter,
		afterEnter,
	}) {
		super();

		this.cache = {}; // Stores page content

		// Callbacks
		this.onLeave = typeof onLeave === 'function' ? onLeave : () => {};
		this.onEnter = typeof onEnter === 'function' ? onEnter : () => {};
		this.afterEnter = typeof afterEnter === 'function' ? afterEnter : () => {};
		this.beforeEnter =
			typeof beforeEnter === 'function' ? beforeEnter : () => {};

		this.pages = pages; // each page has a class and url(s)
		// this.canvas = canvas;
		this.preloader = new Preloader(); // allows using custom preloader

		this.content = document.querySelector('.content');

		this.wrapper = this.content.parentElement;

		this.template = this.content.getAttribute('data-template');
		GlobalHandler.setTemplate = this.template;

		this.wrapper.setAttribute('data-page', this.template);

		this.current = {
			page: null,
			url: null,
		}; // current page

		this.next = {
			page: null,
			url: null,
		}; // next page

		this.page404 = this.findPageObjectByPath('/404');
		if (!this.page404) console.warn('No 404 page found!');

		this.current = this.pickPage();

		this.addLinkListeners();
		this.addEventListeners();

		// Once everything is loaded, save page to cache
		this.router = new Router(this);

		// Adds loaded page to the cache
		this.preloader.on('completed', this.savePageToCache.bind(this));

		this.clickedTheLink = false;
		this.isChanging = false;
	}

	/**
	 * PAGES
	 */
	findPageObjectByPath(path) {
		return this.pages.find((pageObject) => pageObject.url.includes(path));
	}

	pickPage(url = window.location.href) {
		const path = getPathFromURL(url);
		const currentPage = this.findPageObjectByPath(path);

		if (!currentPage) {
			return this.page404;
		}

		return currentPage;
	}

	savePageToCache() {
		const path = getPathFromURL(window.location.href);

		if (!this.cache[path]) {
			const wrapperhtml = htmlWithoutPin(this.wrapper); // removes .pin-spacer from clonedDoc
			this.cache[path] = wrapperhtml; // saves html without pin-spacer
		}
	}

	/**
	 * LISTENERS
	 */

	// <a> tag elements
	clickLink(event) {
		if (this.clickedTheLink || this.isChanging) return;

		this.clickedTheLink = true;

		let count = 0;
		function findParentWithHref(element) {
			count++;

			if (count > 10) {
				this.clickedTheLink = false;
				return console.warn(`Made ${count} attempts to find href.`);
			}
			// Recursive function that finds closest parent with href
			if (element && !element.href) {
				return findParentWithHref(element.parentElement);
			}

			if (!element) {
				this.clickedTheLink = false;
				return console.warn(`Made ${count} attempts to find href.`);
			}
			return element;
		}

		let elementWithHref = event.target;
		let { href } = elementWithHref;

		if (!href) {
			elementWithHref = findParentWithHref(event.target.parentElement);
			href = elementWithHref.href;
		}

		const isSamePage = window.location.href === href;
		console.log('isSamePage', isSamePage);

		if (
			(elementWithHref.hasAttribute('data-element-link') &&
				!elementWithHref.hasAttribute('data-page-link')) ||
			isSamePage
		) {
			// We scroll to an element
			this.clickedTheLink = false;

			NodeEmitter.emit('resetState');

			this.emit('scrollTo', elementWithHref.getAttribute('data-element-link'));
			return;
		}

		if (
			elementWithHref.hasAttribute('data-element-link') &&
			elementWithHref.hasAttribute('data-page-link')
		) {
			// We scroll to an element
			this.onChange({
				url: href,
				scrollTo: elementWithHref.getAttribute('data-element-link'),
			});
		}

		if (
			!elementWithHref.hasAttribute('data-element-link') &&
			elementWithHref.hasAttribute('data-page-link')
		) {
			// We change the page
			this.onChange({ url: href });
		}
	}

	addLinkListeners() {
		this.links = document.querySelectorAll('[data-page-link]'); // page links must have [data-page-link]
		this.linksElements = document.querySelectorAll('[data-element-link]'); // page links must have [data-page-link]

		each([this.links, this.linksElements], (links) => {
			each(links, (link) => {
				link.addEventListener('click', (e) => {
					e.preventDefault();
					if (this.clickedTheLink) return;
					this.clickLink(e);
				});
			});
		});
	}

	removeLinkListeners() {
		each([this.links, this.linksElements], (links) => {
			each(links, (link) => {
				link.removeEventListener('click', (e) => {
					e.preventDefault();
					if (this.clickedTheLink) return;
					this.clickLink(e);
				});
			});
		});

		this.links = null;
	}

	// onPopState
	onPopState(e) {
		this.onChange({ url: window.location.pathname, push: false });
	}

	addEventListeners() {
		window.addEventListener('popstate', this.onPopState.bind(this));
	}

	/**
	 * CHANGE EVENT
	 */
	async onChange({ url, push = true, scrollTo }) {
		if (window.location.href === url) return (this.clickedTheLink = false); // Same Page

		await this.preloader.show();

		// Lead to the cached page
		// @TODO fix [data-pre] related bug
		// @TODO Web Worker to store cached images
		// if (this.cache[url]) {
		// 	return this.navigate({
		// 		cachedHtml: this.cache[url],
		// 		url,
		// 		push,
		// 	});
		// }

		// Or make a new request
		const request = await window.fetch(url);

		if (request.status === 200) {
			this.navigate({
				request,
				url,
				push,
				scrollTo,
			});
		} else {
			console.error('Error', 'Error while fetching the page content');
			window.location.href = '/404';
			this.clickedTheLink = false;

			// const request = await window.fetch('/404');
			// if (request.status === 200) {
			// 	this.navigate({
			// 		request,
			// 		url,
			// 		push,
			// 	});
			// }
			// this.preloader.hide();
		}
	}

	// Idea:
	// onLeave -> clearDOM -> beforeEnter -> addDOM -> onEnter -> createLoader -> afterEnter -> push history
	async navigate({ url, request, cachedHtml, push = true, scrollTo }) {
		if (!request & !cachedHtml)
			return console.error('Critical Error! No request or cache attached.');

		this.onLeave(); // ⚠ onLeave
		this.isChanging = true;

		this.router.destroyCurrentPage(); // Runs destroy() method on the page class

		let html = cachedHtml ? cachedHtml : await request.text(); // Gets HTML from cache or request

		const newPage = this.router.createNewPage(html); // { page, content, template, images }

		this.preloader.selectorChildren.images = newPage.images; // Updating the preloader selector
		this.preloader.createComponent();

		this.router.removeContentFromDOM(); // Removes old .content class from DOM

		this.beforeEnter(); // ⚠ beforeEnter

		this.template = newPage.content.getAttribute('data-template');

		this.router.addContentToDOM(newPage); // Adds new .content into DOM

		this.onEnter(); // ⚠ onEnter

		// Creates the page
		this.current = this.pickPage(url);

		this.addLinkListeners();

		this.afterEnter(); // ⚠ afterEnter

		this.preloader.createLoader(newPage.template);

		if (push) {
			window.history.pushState({}, '', url);
		}

		this.isChanging = false;
		this.clickedTheLink = false;

		if (scrollTo) this.emit('scrollTo', scrollTo);
	}
}
