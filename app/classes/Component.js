import EventEmitter from 'events';
import each from 'lodash/each';
import GlobalHandler from './GlobalHandler';

export default class Component extends EventEmitter {
	constructor({ element, elements }) {
		super();

		this.isReady = false;

		this.selector = element;
		this.selectorChildren = { ...elements };

		this.createComponent();
		// this.addEventListeners();

		GlobalHandler.registerDestroy(this.destroy.bind(this));
		GlobalHandler.registerResize(this.onResize.bind(this));
	}

	create() {}

	createComponent() {
		this.element = null;
		this.elements = null;

		if (this.selector instanceof window.HTMLElement) {
			this.element = this.selector;
		} else {
			this.element = document.querySelector(this.selector) ?? null;
		}

		this.elements = {};

		this.addChildren(this.selectorChildren, this.elements);

		this.isReady = true;
	}

	// finds the parent object name
	findParent(obj, parent) {
		for (let key in obj) {
			if (typeof obj[key] === 'object') {
				if (obj[key] === parent) {
					return key;
				} else {
					let result = this.findParent(obj[key], parent);
					if (result) {
						return key + '.' + result;
					}
				}
			}
		}
		return null;
	}

	// finds the parent object name (but for array)
	findParentArray(arr, parent = null) {
		for (const key in parent) {
			const item = parent[key];
			if (Array.isArray(item) && item === arr) {
				return key;
			}
		}
		return null;
	}

	// when adding elements, always parses the "this.element". if it doesn't exist, then parses the entire document tree trying to find and query select elements. O(1) when ideal; O(n) when deeply nested;
	addChildren = (data, addTo) =>
		each(data, (entry, key) => {
			// ❔ is existing element -> add element
			if (
				entry instanceof window.HTMLElement ||
				entry instanceof window.NodeList
			) {
				addTo[key] = entry;
			} else if (Array.isArray(entry)) {
				// ❔ is Array -> addChildren (recursion)

				const folder = this.findParentArray(entry, data); // (parent, child)
				addTo[folder] = {};
				this.addChildren(entry, addTo[folder]);
				return;
			} else {
				// ❔ is String -> querySelect elements
				if (typeof entry === 'string')
					addTo[key] = this.element
						? this.element.querySelectorAll(entry)
						: document.querySelectorAll(entry);

				// ❔ is Object -> addChildren -> recursion
				if (typeof entry === 'object') {
					const folder = this.findParent(data, entry).toString(); // (parent, child)

					addTo[folder] = {};

					this.addChildren(entry, addTo[folder]);
					return;
				}

				if (addTo[key].length === 0) {
					// If entry doesn't exist (the NodeList is empty) we set it to null
					addTo[key] = null;
				} else if (addTo[key].length === 1) {
					// If the returned NodeList contains only 1 element, we querySelector that element
					addTo[key] = this.element
						? this.element.querySelector(entry)
						: document.querySelector(entry);
				}
			}
		});

	onResize() {}

	addEventListeners() {}

	removeEventListeners() {}

	destroy() {
		this.isReady = false;
	}
}
