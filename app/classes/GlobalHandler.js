import { checkWebpSupport } from '../utils/utils';

export default class GlobalHandler {
	static callbacksResize = [];
	static callbacksCreate = [];
	static callbacksDestroy = [];
	static callbacksPages = [];
	static isWebpSupported = null;

	static async initWebpSupport() {
		this.isWebpSupported = await checkWebpSupport();
	}

	static registerResize(callback) {
		this.callbacksResize.push(callback);
	}

	static registerCreate(callback) {
		this.callbacksCreate.push(callback);
	}

	static registerDestroy(callback) {
		this.callbacksDestroy.push(callback);
	}

	static registerPage(callback) {
		this.callbacksPages.push(callback);
	}

	static handleResize() {
		// Call all registered callbacks
		for (let callback of this.callbacksResize) {
			callback();
		}
	}

	static handleCreate() {
		for (let callback of this.callbacksCreate) {
			callback();
		}
	}

	static handleDestroy() {
		for (let callback of this.callbacksDestroy) {
			callback();
		}
	}

	static handlePageTemplate() {
		for (let callback of this.callbacksPages) {
			callback();
		}
	}

	static set setTemplate(value) {
		this.template = value;
	}

	static get getTemplate() {
		return this.template;
	}
}
