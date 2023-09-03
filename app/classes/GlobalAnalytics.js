import { initializeApp } from 'firebase/app';
import { getAnalytics, logEvent, setUserProperties } from 'firebase/analytics';
import { getCookie, setCookie } from '../utils/cookie';

const createGlobalAnalytics = (firebaseConfig, Detection) => {
	/* 🟢 🟢 🟢 🟢 🟢 */
	class GlobalAnalytics {
		constructor() {
			this.config = firebaseConfig;
		}

		initAnalytics(adsPersonalization = 'false') {
			const app = initializeApp(this.config);
			this.analytics = getAnalytics(app);
			setUserProperties(this.analytics, { non_personalized_ads: false });
			// this.analytics.setAnalyticsCollectionEnabled(true);
			// this.analytics.setUserProperty(
			// 	ALLOW_AD_PERSONALIZATION_SIGNALS,
			// 	adsPersonalization
			// );

			this.recordPageViewData();
			this.recordDetectionData();
		}

		recordPageViewData() {
			if (window.location.pathname === '/3QbaKq5Vl6') {
				window.globalAnalyticsInstance.trackEvent('Page View', {
					action: 'Visit',
					label: 'via QR Code',
				});
			}
		}

		recordDetectionData() {
			let detectionFormatted = detectDeviceAndBrowser(Detection);
			recordDeviceAndBrowserInfo(detectionFormatted);
		}

		trackEvent(action, parameters = {}, cookieDuration = false) {
			if (!window.cookieAnalytics) return;

			// If event should be recorded only once
			if (cookieDuration) {
				const eventCookie = getCookie(
					`event_${parameters.label ? parameters.label : action}`
				);

				// If event cookie exists, it means event was already recorded, so we return
				if (eventCookie) {
					return;
				}

				// If event cookie doesn't exist, we set it after recording the event
				setCookie(`event_${action}`, 'recorded', cookieDuration); // Set to expire in 1 day
			}

			logEvent(this.analytics, action, parameters);
		}
	}
	/* 🟢 🟢 🟢 🟢 🟢 */
	/**
	 * INSTANCE CREATION AND DETECTION
	 */

	function detectDeviceAndBrowser(detection) {
		let deviceType = 'Unknown';
		let browserType = 'Unknown';

		if (detection.isDesktop) {
			deviceType = 'Desktop';
		} else if (detection.isPhone) {
			deviceType = 'Phone';
		} else if (detection.isTablet) {
			deviceType = 'Tablet';
		}

		if (detection.isEdge) {
			browserType = 'Edge';
		} else if (detection.isFirefox) {
			browserType = 'Firefox';
		} else if (detection.isIE) {
			browserType = 'Internet Explorer';
		} else if (detection.isSafari) {
			browserType = 'Safari';
		}

		return { deviceType, browserType };
	}

	function recordDeviceAndBrowserInfo(detection) {
		const { deviceType, browserType } = detectDeviceAndBrowser(detection);

		window.globalAnalyticsInstance.trackEvent('Device Type', {
			action: 'Visit',
			label: deviceType,
		});

		window.globalAnalyticsInstance.trackEvent('Browser', {
			action: 'Visit',
			label: browserType,
		});
	}

	if (typeof window.globalAnalyticsInstance === 'undefined') {
		window.globalAnalyticsInstance = new GlobalAnalytics(firebaseConfig);
	}
};

export default createGlobalAnalytics;
