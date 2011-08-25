// ==UserScript==
// @description This script will interface Pivotal Tracker with Freshbooks
// @include https://www.pivotaltracker.com/projects/*
// @exclude https://www.pivotaltracker.com/projects/
// @exclude https://www.pivotaltracker.com/projects/*/*
// @require https://raw.github.com/MatthewMaclean/Pivotal-Tracker--FreshBooks-Integration/master/jquery.js
// @require https://raw.github.com/MatthewMaclean/Pivotal-Tracker--FreshBooks-Integration/master/main.js
// @require https://raw.github.com/MatthewMaclean/Pivotal-Tracker--FreshBooks-Integration/master/FireFox_Specific_Files/106368.user.js
// @require https://raw.github.com/MatthewMaclean/Pivotal-Tracker--FreshBooks-Integration/master/jquery.sexy-combo-2.1.3/jquery.sexy-combo.min.js
// @resource sexy-combo.css https://raw.github.com/MatthewMaclean/Pivotal-Tracker--FreshBooks-Integration/master/jquery.sexy-combo-2.1.3/css/sexy-combo.css

// @name Freshbooks Integration
// @namespace MattMaclean
// @version v1
// ==/UserScript==

/*
 * Matt Maclean
 * August 15, 2011
 * 
 * This user script is run on the Pivotal Tracker site, interfacing allowing it to interface with the hour logging feature of Freshbooks.
 * The key purpose of the program is to allow one to track hours spent working on stories/chores/bugs as well as provide a detailed log
 * of what was worked on each day in the user's freshbooks account.
 * 
 */	

//to make a cross server scripting call I used GM_xmlhttpRequest so that I could recieve xml data without a proxy, GreaseMonkey specifc
function freshBooksAPICall(parameters){
	GM_xmlhttpRequest({ //needed to use to do xss and recieve xml (without using proxy), doesn't work on chrome
		dataType: parameters.dataType || "text xml",
		method: parameters.method || "POST",
		user: parameters.user || globalVar['fbKey'],
		url: parameters.url || globalVar['fbURL'],
		onload: parameters.success || function(){},
		data: parameters.data || "",
		onerror: parameters.onError || function(){}
	});
}

//the returned information from the ajax request needs to be handled differently as it is a 
function extractData(request){
	return request.responseText;
}

//different method for logging messages to the console in GreaseMonkey
function errorLog(info){
	GM_log(info);	
}

//no images are greasemonkey specific
function browserSpecificCSSImages(){ 
}
