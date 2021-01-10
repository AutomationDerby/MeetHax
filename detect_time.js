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
const BreakException = {};

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
	let crLocation = "";
	let alrSent = false;
    setInterval(function() {
		// chrome.extension.getBackgroundPage().console.log(Object.keys(times));
		try{
        Object.keys(times).forEach((time_name) =>  {
			 // chrome.extension.getBackgroundPage().console.log("Scanned through JSON time " + time_name + " at time " + new Date().toJSON());
            let endChecker = new Date(time_name);
			current = new Date();
            endChecker.setMinutes(endChecker.getMinutes() + times[time_name][1]);
			 // chrome.extension.getBackgroundPage().console.log("Time left until launch of this lesson: (ms)" + ((current - new Date(time_name))*-1));
			 // chrome.extension.getBackgroundPage().console.log("Time left until end of the lesson (ms): " + ((current - endChecker)*-1));
            if (current - new Date(time_name) < 0 || (current - new Date(time_name) >= 0 && current - endChecker < 0)) {
                next = times[time_name];
				// chrome.extension.getBackgroundPage().console.log("Found timing match");
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
								chrome.extension.getBackgroundPage().console.log("Tab ID: " + tab.id);
                                endTime.setMinutes(endTime.getMinutes() + next[1]);
                                chrome.tabs.onRemoved.addListener((tabId, removeId) => {
                                    if (tabId == thisID && (endTime - new Date() > 0)) {
                                        createTab();
                                    }
                                });
								chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
								// chrome.extension.getBackgroundPage().console.log("Link set: " + crLocation + "\nLink default: " + next[0]);
								if (tabId === tab.id && changeInfo.status == 'complete') {
								chrome.tabs.onUpdated.removeListener(listener);
								// Now the tab is ready!
								setTimeout(() => chrome.tabs.sendMessage(tab.id, {verified: true, sender: "detect_time"}), 1000);
								}
								});
								chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
									if(message["currentLocation"] && (message["currentLocation"] != "")){crLocation = message["currentLocation"];}
									chrome.tabs.onUpdated.addListener((tabId, changeInfo, newTab) => {
								//		 chrome.extension.getBackgroundPage().console.log("Link set: " + changeInfo.url + "\nLink default: " + next[0] + "\nSupposed link: " + crLocation + "\nCurrent Status: " + changeInfo.status);
										if((
										((changeInfo.url != undefined && changeInfo.url["length"] > 5) && 
									(crLocation != undefined && crLocation.length > 22)) &&
									(changeInfo.url != crLocation && changeInfo.url != next[0])
									) && (tabId == tab.id && (endTime - new Date() > 0))){
											chrome.tabs.update(tabId, {url: next[0]});
										}
		 							});
								});
                                window.setTimeout(() => {
                                  //  try {
										// chrome.extension.getBackgroundPage().console.log("Tab closed for " + next[0]);
										chrome.tabs.sendMessage(tab.id, {verified: true, sender: "detect_time"});
										crLocation = "";
                                        chrome.tabs.remove(tab.id);
                                  //  } catch (e) {}
                                }, endTime - new Date());
                            })
                        };
                        createTab();
                    }, (new Date(time_name) - current));
                }
                throw BreakException;
            }
        });
		}catch(e){
			if(e != BreakException) throw e;
		}
		}, 1000);
}
timings.send();
