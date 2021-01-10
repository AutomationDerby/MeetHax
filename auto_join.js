// MeetHax was originally called XYZBot.
/*
    ***************************************
    Changelog:
	- Userscript converted into extension.
    ***************************************
    */
'use strict'
let autoJoin = () => {
	try {
		document.querySelector('[data-tooltip="Turn off microphone (ctrl + d)"]').click();
	} catch (e) {} // Turn off your microphone. Nobody wants to hear your cat.
	try {
		document.querySelector('[data-tooltip="Turn off camera (ctrl + e)"]').click();
	} catch (e) {} // Turn off your camera. Nobody wants to see your clothes wardrobe.
	try {
		document.querySelector('[jsname="Qx7uuf"]').click();
	} catch (e) {} // Join now!
	try {
		document.querySelector('[jsname="Qx7uuf"]').click();
	} catch (e) {} // Join now!
	const buttons = [{
			label: 'Microphone',
			storageName: 'disableMic',
			buttonKey: 'Turn off microphone (ctrl + d)',
			direction: 'right',
		},
		{
			label: 'Camera',
			storageName: 'disableCam',
			buttonKey: 'Turn off camera (ctrl + e)',
			direction: 'left',
		},
	];

	buttons.forEach(({
		label,
		storageName,
		buttonKey,
		direction
	}) => {

		/** @type {HTMLDivElement} */
		const button = document.querySelector(`div[role="button"][data-tooltip$=" + ${buttonKey})" i][data-is-muted]`);
		if (!button) return;

		/** @type {boolean} */

		/** @return {void} */
		const disable = () => {
			if (button.dataset.isMuted === 'false')
				button.click();
		};

		disable();
	});
};
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.clear) {
		delete localStorage.flagUpdate;
	}
});
window.onload = function () {
	window.setInterval(function () {
		if ((document.body.innerHTML.includes('<div class="jtEd4b">You can\'t create a meeting yourself.') || document.body.innerHTML.includes('<div jsname="r4nke" class="CRFCdf">This meeting hasn\'t started yet</div>')) || document.body.innerHTML.includes('<div jsname="r4nke" class="CRFCdf">Someone has removed you from the meeting</div>')) {
			//Hitman mode
			if (localStorage["flagUpdate"]) {
				try {
					chrome.runtime.sendMessage({
						joined: (document.body.innerHTML.includes('<div jsname="r4nke" class="CRFCdf">This meeting hasn\'t started yet</div>')),
						currentLocation: location.href
					});
				} catch (e) {}
				location.reload();
			
			chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
				if (request.verified && request.sender == "detect_time") {
					localStorage.flagUpdate = true;
					sendResponse({
						joined: (document.body.innerHTML.includes('<div jsname="r4nke" class="CRFCdf">This meeting hasn\'t started yet</div>')),
						currentLocation: location.href
					});
					location.reload(); // Reload if the Google Meet hasn't started. We want to reload it until it starts.
				}
			});
			location.reload(); // Reload if the Google Meet hasn't started. We want to reload it until it starts.
		}} 
		else if (document.body.innerHTML.includes("<div class=\"Xzzw9d\">Cast this meeting</div>")) {
			if (localStorage["flagUpdate"]) {
				localStorage["flagUpdate"] = false;
				// AutoJoin mode
				try {
					chrome.runtime.sendMessage({
						joined: true,
						currentLocation: location.href
					});
				} catch (e) {}
				autoJoin(); //Automatic Join
			}
			chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
				if (request.verified && request.sender == "detect_time") {
					localStorage.flagUpdate = true;
					sendResponse({
						joined: true,
						currentLocation: location.href
					});
					autoJoin(); // Automatic Join
				}
			});
			autoJoin();
		}
	}, 1000);
};
