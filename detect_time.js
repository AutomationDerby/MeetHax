// MeetHax was originally called XYZBot.
/*
    ***************************************
    Changelog:
	- Added function to rejoin after removal
	- Added duration function (Expirenmental)
	- Added background script to open tabs
	- Userscript converted into extension.
    ***************************************
    */

/*
timings.json needs to be in this format:
"JSON FORMATTED STRING OF TIME MEET TO BE LOG IN": ["link to google meet", duration (in minutes), false],
and put as many links in here, the links need to be sorted
*/
const sortObject = (unordered) => {
    return Object.keys(unordered).sort().reduce(
        (obj, key) => {
            obj[key] = unordered[key];
            return obj;
        }, {}
    );
}
var timings = new XMLHttpRequest();
timings.open("GET", chrome.runtime.getURL("timings.json"));
timings.onload = function() {
    let tin = timings.responseText;
    let times = sortObject(JSON.parse(tin));
    let next = null;
	let current = new Date();
    setInterval(function() {
        for (let time_name in times) {
			// chrome.extension.getBackgroundPage().console.log("Scanned through JSON time " + time_name + " at time " + new Date().toJSON());
            let endChecker = new Date(time_name);
			current = new Date();
            endChecker.setMinutes(endChecker.getMinutes() + times[time_name][1]);
			// chrome.extension.getBackgroundPage().console.log("Time left until launch of this lesson: (ms)" + ((current - new Date(time_name))*-1));
			// chrome.extension.getBackgroundPage().console.log("Time left until end of the lesson (ms): " + ((current - endChecker)*-1));
            if (current - new Date(time_name) < 0 || (current - new Date(time_name) >= 0 && current - endChecker < 0)) {
                next = times[time_name];
                if (next[2] == false) {
					// chrome.extension.getBackgroundPage().console.log("Selected " + time_name + " that hasn't been launched.");
                    next[2] = true;
                    setTimeout(() => {
                        let createTab = () => {
                            chrome.tabs.create({
                                url: next[0]
                            }, tab => {
								// chrome.extension.getBackgroundPage().console.log("Tab opened for " + next[0]);
                                let endTime = new Date(time_name);
                                let thisID = tab.id;
                                endTime.setMinutes(endTime.getMinutes() + next[1]);
                                chrome.tabs.onRemoved.addListener((tabId, removeId) => {
                                    if (tabId == thisID && (endTime - new Date() > 0)) {
                                        createTab();
                                    }
                                });
                                window.setTimeout(() => {
                                  //  try {
										// chrome.extension.getBackgroundPage().console.log("Tab closed for " + next[0]);
                                        chrome.tabs.remove(tab.id);
                                  //  } catch (e) {}
                                }, endTime - new Date());
                            })
                        };
                        createTab();
                    }, (new Date(time_name) - current));
                }
                break;
            }
        }
    }, 1000);
}
timings.send();