import Page from '../../classes/Page';
import each from 'lodash/each';

export default class NotFound extends Page {
	constructor(el) {
		super({
			element: el,
		});
		this.id = '404';
	}

	create() {
		if (this.template != this.id) return;

		if (!this.isReady) super.createComponent();
	}
}
