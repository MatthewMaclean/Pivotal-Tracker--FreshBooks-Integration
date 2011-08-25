//cross server scripting is not required due to the permissions in the manifest for the extension
function freshBooksAPICall(parameters){
	$.ajax({
		contentType: "text/xml",
		dataType: parameters.dataType || "application/xml",
		type: parameters.method || "POST",
		username: parameters.user || globalVar['fbKey'],
		url: parameters.url || globalVar['fbURL'],
		success: parameters.success || function(){},
		data: parameters.data || "",
		error: parameters.onError || function(){}
	});
}

//the information recieved from the ajax request is the data required
function extractData(request){
	return request;	
}

//different command to log to console than in firefox's GreaseMonkey
function errorLog(info){
	console.error(info);	
}

//the extension's id is required to import these images and add them into the css
//since the id will change if it is an unpacked app, I need to dynamically load it on startup of the app
//instead of hardcoding it in. This is chrome specific as firefox doesn't use these images.
//These css lines were commented out in jquery-ui-1.7.3.custom.css
function browserSpecificCSSImages(){
	var extensionID = chrome.i18n.getMessage("@@extension_id"); //retrieves extensions ID for use in importing the images
	
	addGlobalStyle('.ui-widget-content { border: 1px solid #aaaaaa; background: #ffffff url(chrome-extension://' + extensionID + '/images/ui-bg_flat_75_ffffff_40x100.png) 50% 50% repeat-x; color: #222222; }');
	addGlobalStyle('.ui-widget-header { border: 1px solid #aaaaaa; background: #cccccc url(chrome-extension://' + extensionID + '/images/ui-bg_highlight-soft_75_cccccc_1x100.png) 50% 50% repeat-x; color: #222222; font-weight: bold; }');
	
	addGlobalStyle('.ui-state-default, .ui-widget-content .ui-state-default { border: 1px solid #d3d3d3; background: #e6e6e6 url(chrome-extension://' + extensionID + '/images/ui-bg_glass_75_e6e6e6_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #555555; outline: none; }');
	addGlobalStyle('.ui-state-hover, .ui-widget-content .ui-state-hover, .ui-state-focus, .ui-widget-content .ui-state-focus { border: 1px solid #999999; background: #dadada url(chrome-extension://' + extensionID + '/images/ui-bg_glass_75_dadada_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #212121; outline: none; }');
	addGlobalStyle('.ui-state-active, .ui-widget-content .ui-state-active { border: 1px solid #aaaaaa; background: #ffffff url(chrome-extension://' + extensionID + '/images/ui-bg_glass_65_ffffff_1x400.png) 50% 50% repeat-x; font-weight: normal; color: #212121; outline: none; }');
	
	addGlobalStyle('.ui-state-highlight, .ui-widget-content .ui-state-highlight {border: 1px solid #fcefa1; background: #fbf9ee url(chrome-extension://' + extensionID + '/images/ui-bg_glass_55_fbf9ee_1x400.png) 50% 50% repeat-x; color: #363636; }');
	addGlobalStyle('.ui-state-error, .ui-widget-content .ui-state-error {border: 1px solid #cd0a0a; background: #fef1ec url(chrome-extension://' + extensionID + '/images/ui-bg_glass_95_fef1ec_1x400.png) 50% 50% repeat-x; color: #cd0a0a; }');
	
	addGlobalStyle('.ui-icon { width: 16px; height: 16px; background-image: url(chrome-extension://' + extensionID + '/images/ui-icons_222222_256x240.png); }');
	addGlobalStyle('.ui-widget-content .ui-icon {background-image: url(chrome-extension://' + extensionID + '/images/ui-icons_222222_256x240.png); }');
	addGlobalStyle('.ui-widget-header .ui-icon {background-image: url(chrome-extension://' + extensionID + '/images/ui-icons_222222_256x240.png); }');
	addGlobalStyle('.ui-state-default .ui-icon { background-image: url(chrome-extension://' + extensionID + '/images/ui-icons_888888_256x240.png); }');
	addGlobalStyle('.ui-state-hover .ui-icon, .ui-state-focus .ui-icon {background-image: url(chrome-extension://' + extensionID + '/images/ui-icons_454545_256x240.png); }');
	addGlobalStyle('.ui-state-active .ui-icon {background-image: url(chrome-extension://' + extensionID + '/images/ui-icons_454545_256x240.png); }');
	addGlobalStyle('.ui-state-highlight .ui-icon {background-image: url(chrome-extension://' + extensionID + '/images/ui-icons_2e83ff_256x240.png); }');
	addGlobalStyle('.ui-state-error .ui-icon, .ui-state-error-text .ui-icon {background-image: url(chrome-extension://' + extensionID + '/images/ui-icons_cd0a0a_256x240.png); }');
	
	addGlobalStyle('.ui-widget-overlay { background: #aaaaaa url(chrome-extension://' + extensionID + '/images/ui-bg_flat_0_aaaaaa_40x100.png) 50% 50% repeat-x; opacity: .30;filter:Alpha(Opacity=30); }');
	addGlobalStyle('.ui-widget-shadow { margin: -8px 0 0 -8px; padding: 8px; background: #aaaaaa url(chrome-extension://' + extensionID + '/images/ui-bg_flat_0_aaaaaa_40x100.png) 50% 50% repeat-x; opacity: .30;filter:Alpha(Opacity=30); -moz-border-radius: 8px; -webkit-border-radius: 8px; }');	
}