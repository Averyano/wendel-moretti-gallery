import each from 'lodash/each';

export const htmlWithoutPin = (wrapper) => {
	// Parse the HTML string into a DOM
	let parser = new DOMParser();
	let doc = parser.parseFromString(wrapper.innerHTML, 'text/html');

	// Clone the document for modification
	let cloneDoc = doc.cloneNode(true);

	// Select 'pin-spacer' elements
	let pinSpacers = cloneDoc.querySelectorAll('.pin-spacer');

	each(pinSpacers, (pinSpacer) => {
		const pinSpacerParent = pinSpacer.parentNode;

		// Move all children from 'pin-spacer' to its parent
		while (pinSpacer.firstChild) {
			pinSpacerParent.insertBefore(pinSpacer.firstChild, pinSpacer);
		}

		// Remove 'pin-spacer' from its parent
		pinSpacerParent.removeChild(pinSpacer);
	});

	// Serialize the DOM back into a string
	let serializer = new XMLSerializer();
	return serializer
		.serializeToString(cloneDoc.body)
		.replace(/^<body>|<\/body>$/gi, '');
};

export const getPathFromURL = (href) => {
	const isCompleteURL = href.includes('://');

	if (!isCompleteURL) {
		const tempAnchor = document.createElement('a');
		tempAnchor.href = href;
		return tempAnchor.pathname;
	}

	const urlObject = new URL(href);
	return urlObject.pathname;
};
