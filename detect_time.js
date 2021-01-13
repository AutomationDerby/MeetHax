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
	let mCodeExp = false;
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
								let checkOnline = setInterval(() => {
									let onlineChecker = new XMLHttpRequest();
									onlineChecker.open("GET", "https://meet.google.com/");
									onlineChecker.onerror = () => {
									//	console.log("Network is offline. Google keeps their servers up, and this extension is built for Google Meet, so if Google is down, Google Meet is also down, so this extension becomes useless.");
											chrome.tabs.remove(tab.id); // refresh the page until it works.
									};
									onlineChecker.send();
								}, 1000);
								chrome.tabs.onUpdated.addListener((tabId, changeInfo) => chrome.extension.getBackgroundPage().console.log(changeInfo));
								chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
									chrome.extension.getBackgroundPage().console.log(changeInfo);
								// chrome.extension.getBackgroundPage().console.log("Link set: " + crLocation + "\nLink default: " + next[0]);
								if (tabId === tab.id && changeInfo.status == 'complete') {
								chrome.tabs.onUpdated.removeListener(listener);
								// Now the tab is ready!
								setTimeout(() => chrome.tabs.sendMessage(tab.id, {verified: true, sender: "detect_time"}), 1000);
								}
								});
								chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
									mCodeExp = new Boolean(message["expired"]).valueOf();
									if(message["currentLocation"] && (message["currentLocation"] != "")){crLocation = message["currentLocation"];}
									chrome.tabs.onUpdated.addListener((tabId, changeInfo, newTab) => {
										chrome.extension.getBackgroundPage().console.log(changeInfo);
										 chrome.extension.getBackgroundPage().console.log("Link set: " + changeInfo.url + "\nLink default: " + next[0] + "\nSupposed link: " + crLocation + "\nCurrent Status: " + changeInfo.status);
										if(((
										((changeInfo.url != undefined && changeInfo.url["length"] > 5) && 
									(crLocation != undefined && crLocation.length > 22)) &&
									(changeInfo.url != crLocation && changeInfo.url != next[0])
									) && (tabId == tab.id && (endTime - new Date() > 0))) || (mCodeExp && (next[0].includes("/lookup/")))){
										if((mCodeExp && (next[0].includes("/lookup/")))){
											crLocation = next[0];
										}
											chrome.tabs.update(tabId, {url: next[0]});
										}
		 							});
								});
                                window.setTimeout(() => {
                                    try {
										// chrome.extension.getBackgroundPage().console.log("Tab closed for " + next[0]);
										chrome.tabs.sendMessage(tab.id, {verified: true, sender: "detect_time"});
										crLocation = "";
										clearInterval(checkOnline);
                                        chrome.tabs.remove(tab.id);
                                    } catch (e) {}
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
