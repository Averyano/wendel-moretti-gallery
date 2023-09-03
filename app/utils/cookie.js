// Set cookie
export function setCookie(cookieName, cookieValue, expirationDays) {
	const expirationDate = new Date();
	expirationDate.setDate(expirationDate.getDate() + expirationDays);

	// Create the cookie string with the cookie name, value, and expiration date
	const cookieString =
		cookieName +
		'=' +
		cookieValue +
		';expires=' +
		expirationDate.toUTCString() +
		';path=/';

	// Set the cookie in the browser
	document.cookie = cookieString;
}

// Get cookie
export function getCookie(cookieName) {
	// Split the document.cookie string into individual cookies
	const cookies = document.cookie.split(';');

	// Loop through the cookies to find the one with the specified name
	for (var i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();

		// Check if the cookie matches the specified name
		if (cookie.indexOf(cookieName + '=') == 0) {
			// If it matches, return the value of the cookie
			return cookie.substring((cookieName + '=').length, cookie.length);
		}
	}

	// If no matching cookie was found, return null
	return null;
}
