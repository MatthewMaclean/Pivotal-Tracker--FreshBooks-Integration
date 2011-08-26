// I get the values from the dialog box way to often
// Should combine function inside of each other so that they have access to the variables so that I only have to grab the values once



/* 
 *Current Bugs:
 * 
 *  - If over 100 entries are returned by a call to the Freshbooks API, the list will be truncated at 100.
 *  - Buttons only added to current_itemList, if a clone is created, buttons will not appear
 *  - User script relies on some of the naming scheme used in the pivotal tracker API, which can be changed by them at any point
 *  - If user manually deletes or edits a task related to hours spent on a project, freshbooks will not update accordingly
 *  - If user changes their freshbooks password, without changing their key in the userscript, it will no longer work.
 *  - Has to check every couple seconds to see if buttons exist instead of wating for specific activites to trigger 
 *  - User can't tell very well if their credentials were incorrectly enterred
 *  - The user has to open up the javascript file to enter their credentials
*/

/*
 * Future Features?
 *
 *   - Choose from non-time related tasks to populate extra notes field
 */

// ----------------------------- Global Variables ----------------------------- //


var globalVar = {
	
	//edit the following 4 variables appropriately
	'name' : "",				//your full name
	'ptKey' : "",                           //pivotaltracker.com >> profile >> API Token at bottom of screen
	'fbKey' : "",				//your freshbooks site >> profile >> Authentication Token at bottom of screen
	'fbURL' : "",				//your freshbooks site >> profile >> API URL at bottom of screen
	
	
	
	'ptProjectID' : (/\d+/.exec(window.location.href)).toString(),
	'ptProjectName' : $(".projectName").text(),
	'initialAjaxCheckIntervalID' : 0
};

// ----------------------------- Misc Functions ----------------------------- //

//converts hours and minutes into a string, seperated by a colon
function timeToString(hours, minutes) {
	var extraHours = parseInt(minutes / 60, 10); //adjusts minutes to be < 60
	hours = parseInt(hours + extraHours, 10);
	minutes = parseInt(minutes - 60 * extraHours, 10);
	
	if (minutes < 10) { //adjusts minutes if it is a single digit
		minutes = "0" + minutes;
	}

	return hours + ":" + minutes;
}

//returns the id that I use for the button shown on pivotal tracker
//takes the current story's id number as the argument
function timeButtonID(storyID) {
	return "current_itemList_story" + storyID + "_content_buttons_hoursSpent";
}

//returns the id of the button specified by pivotal tracker that allows a user
//to expand or collapse a story to edit/save it's contents
function editButtonID(storyID) {
	return "current_itemList_story" + storyID + "_content_icons_editButton";
}

//checks if the date given is valid, given the year, month and date
//modified from http://byatool.com/ui/jquery-validate-datecheck-if-is-date/
function isValidDate(year, month, day) { 
    var format = "yy-mm-dd";
    
	if (parseInt(month, 10) < 10) { //adding a 0 if either are only a single digit so that month and day are both 2 digits long
		month = "0" + month;
	}
	
	if (parseInt(day, 10) < 10) {
		day = "0" + day;
	}
	
    try {
        jQuery.datepicker.parseDate(format, year + "-" + month + "-" + day, null); //will error if the entered date is invalid
    } catch (error) {
		errorLog("Submitted Date: " + year + "-" + month + "-" + day + "\nError: " + error);
        return false;
    }
    
    return true;
}

//tests if the string contains only digits
function checkIfInteger(str) { 
	return (/^\d+$/).test(str);
}
// ----------------------------- Dialog Box Functions ----------------------------- //


//fixes the entries in the Dialog box
//performed after the submit button was clicked
function cleanDialogBoxTime() {
	var formElements = document.forms.namedItem('ajaxForm').elements;
	var hours = formElements.namedItem('hours');
	var minutes = formElements.namedItem('minutes');
	var extraHours = parseInt(minutes.value / 60, 10); //adjusts minutes to be < 60
	
	hours.value = parseInt(hours.value, 10) + extraHours;
	minutes.value = parseInt(minutes.value, 10) - 60 * extraHours;
	
	if (parseInt(minutes.value, 10) < 10) {
		minutes.value = "0" + minutes.value;
	}
}

//checks to see if all the required fields were filled with proper values
//performed after the submit button was clicked
function validateDialogBox() {
	var formElements = document.forms.namedItem('ajaxForm').elements;
	var day = formElements.namedItem('day').value;
	var month = formElements.namedItem('month').value;
	var year = formElements.namedItem('year').value;
	var hours = formElements.namedItem('hours').value;
	var minutes = formElements.namedItem('minutes').value;
	var projectID = formElements.namedItem('projectMenu').value;
	var taskID = formElements.namedItem('taskMenu').value;
	var invalidForms = "";
	
	if (!checkIfInteger(day)) {
		invalidForms += "\t-Day is not an integer\n";
	}
	
	if (!checkIfInteger(month)) {
		invalidForms += "\t-Month is not an integer\n";
	}
	
	if (!checkIfInteger(year)) {
		invalidForms += "\t-Year is not an integer\n";
	}
	
	if (!checkIfInteger(hours)) {
		invalidForms += "\t-Hours is not an integer\n";
	}
	
	if (!checkIfInteger(minutes)) {
		invalidForms += "\t-Minutes is not an integer\n";
	}
	
	if (parseInt(hours, 10) < 0) {
		invalidForms += "\t-Hours is less than 0\n";
	}
	
	if (parseInt(minutes, 10) < 0) {
		invalidForms += "\t-Minutes is less than 0\n";
	}
	
	if (parseInt(minutes, 10) === 0 && parseInt(hours, 10) === 0) {
		invalidForms += "\t-Can't log 0 hours\n";
	}
	
	if (!isValidDate(year, month, day)) {
		invalidForms += "\t-Date is invalid\n";
	}
	
	if (projectID === "nothing") {
		invalidForms += "\t-Need to choose a Project\n";
	}
	
	if (taskID === "nothing") {
		invalidForms += "\t-Need to choose a Task\n";
	}
	
	if (invalidForms !== "") {
		alert("Invalid entries:\n" + invalidForms);
		return false;
	} else {
		return true;
	}
}

//retrieves the date from the dialog box and returns in the format yyyy-mm-dd
function getDialogBoxDate() {
	var formElements = document.forms.namedItem('ajaxForm').elements;
	var year = formElements.namedItem('year').value;
	var month = formElements.namedItem('month').value;
	var day = formElements.namedItem('day').value;
	
	if (parseInt(month, 10) < 10) { //adding a 0 if either are only a single digit so that month and day are both 2 digits long
		month = "0" + month;
	}
	
	if (parseInt(day, 10) < 10) {
		day = "0" + day;
	}
	
	return year + "-" + month + "-" + day;
}

//retrieves the time from the dialog box and returns it in the number of hours
function getDialogBoxTimeInHours() {
	var formElements = document.forms.namedItem('ajaxForm').elements;
	var hours = formElements.namedItem('hours').value || 0;
	var minutes =  formElements.namedItem('minutes').value || 0;
	
	return (parseFloat(hours) + parseFloat(minutes) / 60).toFixed(2); //consider doing arithmetic with integers?
}

//updates the time on the button
//this is performed after freshbooks has been successfully updated with the time entry
function updateTime() {
	var formElements = document.forms.namedItem('ajaxForm').elements;
	var day = parseInt(formElements.namedItem('day').value, 10);
	var month = parseInt(formElements.namedItem('month').value, 10);
	var year = parseInt(formElements.namedItem('year').value, 10);
	var hours = parseInt(formElements.namedItem('hours').value, 10);
	var minutes = parseInt(formElements.namedItem('minutes').value, 10);
	var storyID = $('#dialogHourLog').data('storyID'); //the ID of the story having hours added to it has already beeen saved with the dialog box
	
	$.ajax({
		context: $("#" + timeButtonID(storyID)), //passes the storyID to the success function incase another call is made before the ajax call recieves the necessary data
		dataType: "xml",   
		contentType: "text/xml",
		data: "<task><description>#fb " + globalVar['name'] + ": " + day + "/" + month + "/" + year + " - " + timeToString(hours, minutes) + "</description><complete>true</complete></task>",
		url: 'https://www.pivotaltracker.com/services/v2/projects/' + globalVar['ptProjectID'] + '/stories/' + storyID + '/tasks',
		type: 'POST',
		beforeSend: function (xhr) {
			xhr.setRequestHeader("X-TrackerToken", globalVar['ptKey']);
		},
		success: function (data) {
			var button = this.context;
			var previousLog = button.text(); //previous hour count
			var description = $($(data).find("description")).text(); //information submitted to pivotal tracker
			var hours = parseInt((/\d+/).exec(description.substring(description.indexOf("-"))), 10); //gets added hours from data submitted to Pivotal Tracker
			var minutes = parseInt((/\d+/).exec(description.substring(description.lastIndexOf(":"))), 10); //gets added minutes from data submitted to Pivotal Tracker
			
			hours += parseInt(previousLog.substring(0, previousLog.indexOf(":")), 10); //adds new hours to those from the button
			minutes += parseInt(previousLog.substring(previousLog.indexOf(":") + 1), 10); //adds new minutes to those from the button
			
			button.text(timeToString(hours, minutes));
		},
		error: function (xhr, textStatus, errorThrown) {
			alert("Error interfacing with the Pivotal Tracker API. Please check the console for more information.");
			errorLog("When: While submitting a task entry to Pivotal Tracker, after a successful submission to Freshbooks." + "\nxhr: " + xhr + "\ntextStatus: " + textStatus + "\nerrorThrown: " + errorThrown);
		}
	});
}

//used to properly format the options shown in the dialog box into xml
//parameters:
//	-data is the returned information containing all the possible entries
//  -groupTag is the tag used to store the different projects, tasks, etc
//	-valueTag is the tag used to store the id of the object in the data 
//	-nameTag is the tag used to store the name of the object in the data 
//	-defaultValue is the option displayed when nothing has been chosen
 
function toSelectOptionsHTML(data, groupTag, valueTag, nameTag, defaultValue) {
	var html = '<option value="nothing" selected="selected">' + defaultValue + '</option>';
	
	$(data).find(groupTag).each(function () { //creates an option for each group in the data
		html += '<option value="' + $(this).find(valueTag).text() + '">' + $(this).find(nameTag).text() + '</option>';
	});
	
	return html;
}

//sets the information in the project options field in the dialog box
function setProjectOptions() {
	
	function setValues(request) {
		var data = extractData(request);
		var defaultValue = "Select a project";
		var groupTag = 'project';
		var valueTag = "project_id";
		var nameTag = "name";

		document.forms.namedItem('ajaxForm').elements.namedItem('projectMenu').innerHTML = toSelectOptionsHTML(data, groupTag, valueTag, nameTag, defaultValue);
	}
	
	var _data = '<request method="project.list"><per_page>100</per_page></request>';
	
	freshBooksAPICall({
		data: _data,
		success: setValues,
		onError: function () {
			alert("Error interfacing with the Freshbooks API. Please check the console for more information.");
			errorLog("When: While checking for project options.");
		}
	});
}

//sets the information in the task options field in the dialog box
function setTaskOptions() {
	
	function setValues(request) {
		var data = extractData(request);
		var defaultValue = "Select a task";
		var valueTag = "task_id";
		var nameTag = "name";
		var groupTag = 'task';
		
		document.forms.namedItem('ajaxForm').elements.namedItem('taskMenu').innerHTML = toSelectOptionsHTML(data, groupTag, valueTag, nameTag, defaultValue);
	}
	
	var fbProjectID = document.getElementById('projectMenu').value;
	var _data = '<request method="task.list"><project_id>' + fbProjectID + '</project_id><per_page>100</per_page></request>';
	
	taskSelectList = document.getElementById('taskMenu');
	freshBooksAPICall({
		data: _data,
		success: setValues,
		onError: function () {
			alert("Error interfacing with the Freshbooks API. Please check the console for more information.");
			errorLog("When: While checking for task options, based off the currently selected project.");
		}
	});
}

//sets the format of the forms in the dialog box
function setDialogFormat() {
	var newHTML = "<form id=ajaxForm >";
	
	newHTML += 'Date (dd/mm/yyyy) - <input size="2" maxlength = "2" type="text" name="day"/> /'; //date entry
	newHTML += ' <input size="2" maxlength = "2" type="text" name="month"/> /';
	newHTML += ' <input size="4" maxlength = "4" type="text" name="year"/>';
	
	newHTML += ' </br></br>Hours:Minutes - '; //time entry
	newHTML += ' <input type="text" size= "2" maxlength = "2" name="hours"/> :';
	newHTML += ' <input size= "2" maxlength="2" type="text" name="minutes"/>';	
	
	newHTML += '</br></br> Project - '; //project choice
	newHTML += '<select id="projectMenu" size="1"></select>';
	
	newHTML += '</br></br> Task - '; //task choice
	newHTML += '<select id="taskMenu" size="1"></select>';
	
	newHTML += '</br></br> Extra Notes'; //task choice
	newHTML += '</br><textarea name="extraNotes" rows=8 cols=40></textarea>';
	
	newHTML += '</br></br><input type="submit" name="dialogSubmit" value="Submit" />'; //submit button
	
	newHTML += "</form>";
	return newHTML;
}

//sets the initial text seen in the dialog box
function setTextDialogForm(elements) {
	var currentTime = new Date();
	elements.namedItem('day').value = (currentTime.getDate());
	elements.namedItem('month').value = (currentTime.getMonth() + 1);
	elements.namedItem('year').value = (currentTime.getFullYear());
	elements.namedItem('minutes').value = ("00");
	elements.namedItem('hours').value = ("0");
	elements.namedItem('extraNotes').value = ("");
	
	defaultTaskMenuHTML = '<option value="nothing" selected="selected">Select a task</option>';
	setProjectOptions(); //only sets project options as task options are set when a project is chosen
	
	elements.namedItem('taskMenu').innerHTML = (defaultTaskMenuHTML);
}

//opens the dialog box and binds the storyID of the story currently having hours logged to it
function openDialog(event) {
	var dialogBox = $('#dialogHourLog');
	var storyID = (/\d+/).exec(event.target.id); //gets the storyID from the ID of the button that was clicked
	
	setTextDialogForm(document.forms.namedItem('ajaxForm').elements);
	dialogBox.data('storyID', storyID);
	
	try {
		dialogBox.dialog('open');
	} catch (err) {
		errorLog(err);
		if (!$("#mydialog").dialog("isOpen")) { //firefox will sometimes throw an error even if the dialog box properly opens, so the alert should only be given if it is not open
			alert("Error opening the Dialog Box, check console for more information.");
		}
	}
}


// ----------------------------- Submit Info to FreshBooks ----------------------------- //

//submits time entry to freshbooks
//run before the pivotal tracker task is logged
function submitTimeEntry() {
	
	//checking to see if the time time entry is a duplicate of one already in the database (including project, task, and storyID)
	function compareToCurrentEntries(request) {
		var data = extractData(request);
		var storyID = $('#dialogHourLog').data('storyID'); //gets storyID from dialog box
		var timeEntryList = $(data).find('time_entry');	   //stores references to all the time entries in the data
		var conditionalContext = "";
		var text;
		
		for (var i = 0; i < (timeEntryList).length; i++) {   //for all the time entries
			text = $($(timeEntryList[i]).find('notes')).text()
			
			if (parseInt((/\d+/).exec(text.substring(text.indexOf('storyID')))) === parseInt(storyID)) { //if the storyID of the new entry is the same as one already submitted
				var formElements = document.forms.namedItem('ajaxForm').elements;
				var fbProjectID = formElements.namedItem('projectMenu').value;
				var fbTaskID = formElements.namedItem('taskMenu').value;
				
				if ($($(timeEntryList[i]).find('project_id')).text() === fbProjectID && $($(timeEntryList[i]).find('task_id')).text() === fbTaskID) { //if the project and task is also similar
					conditionalContext = timeEntryList[i]; //sets the context to a context to the duplicate entry so that hours can be added to it
					break;	
				}
			}
		}

		//retrieves story information from Pivotal Tracker
		$.ajax({
			context: conditionalContext,
			dataType: "xml",   
			url: 'https://www.pivotaltracker.com/services/v3/projects/'+globalVar['ptProjectID']+'/stories/' + $('#dialogHourLog').data('storyID'),
			type: 'GET',
			beforeSend: function (xhr) {
				xhr.setRequestHeader("X-TrackerToken", globalVar['ptKey']);
			},
			success: function (request) {
				var formElements = document.forms.namedItem('ajaxForm').elements;
				var fbProjectID = formElements.namedItem('projectMenu').value;
				var fbTaskID = formElements.namedItem('taskMenu').value;
				var fbExtraNotes = formElements.namedItem('extraNotes').value;
				var storyType = $(request).find('story_type').text();
				var timeEstimate;
				var fbNotes;
				
				var fbDate = getDialogBoxDate();
				var data;
				
				//if the context is "" as determined by the conditionalContext variable used above, then there is no similar entry in freshbooks and a new one must be made
				//if a similar entry was found, then the context will give the necessary information to append to
				if (this.context === "") {
					var fbHours = getDialogBoxTimeInHours();
					fbNotes = globalVar['ptProjectName'] + ": " ;
					fbNotes += "(" + $(request).find('labels').text().replace(/,/g, ", ") + ")"; //adds tags to the notes, as well as adds spaces between them as the default format is task1,task2,task3
					fbNotes += "\nstoryID: " + storyID;
					fbNotes += "\nStory Type: " + storyType;
					
					if (storyType === "feature") { //if the story is a feature, adds the estimated time for it
						timeEstimate = $(request).find('estimate').text();
						
						if (timeEstimate === "-1") { //if no time estimate has been made yet for the feature
							fbNotes += " - Estimate: undetermined";
						} else {
							fbNotes += " - Estimate: " + timeEstimate + " point(s)";
						}
						
					}
					
					fbNotes += "\n\n";
					fbNotes += $(request).find('name').text();
					fbNotes += "\n\n\nExtra Notes:"
					if (fbExtraNotes !== "") {
						fbNotes += "\n\n- " + fbExtraNotes;
					}
					
					data = '<request method="time_entry.create"><time_entry><project_id>' + fbProjectID + '</project_id><task_id>' + fbTaskID + '</task_id><hours>' + fbHours + '</hours><notes>' + fbNotes + '</notes><date>' + fbDate + '</date></time_entry></request>';
				} else {	
					var timeEntryID = $($(this.context).find('time_entry_id')).text();
					var previousHours = $($(this.context).find('hours')).text();
					var fbHours = (parseFloat(previousHours) + parseFloat(getDialogBoxTimeInHours())).toFixed(2);
					
					fbNotes = $($(this.context).find('notes')).text();
					if (fbExtraNotes !== "") {
						fbNotes += "\n- " + fbExtraNotes;
					}
					
					data = '<request method="time_entry.update"><time_entry><time_entry_id>' + timeEntryID + '</time_entry_id><project_id>' + fbProjectID + '</project_id><task_id>' + fbTaskID + '</task_id><hours>' + fbHours + '</hours><notes>' + fbNotes + '</notes><date>' + fbDate + '</date></time_entry></request>';	
				}
				freshBooksAPICall({
					data: data,
					success: updateTime,
					onError: function() {		
					alert("Error interfacing with the Freshbooks API. Please check the console for more information.");
					errorLog("When: While submitting a time entry to Freshbooks.");
					}
				});
			},
			error: function(xhr, textStatus, errorThrown) {
				alert("Error interfacing with the Pivotal Tracker API. Please check the console for more information.");
				errorLog("When: While submitting a time entry to Freshbooks." + "\nxhr: " + xhr + "\ntextStatus: " + textStatus + "\nerrorThrown: " + errorThrown);
			}
		});
	}
	
	var entryDate = getDialogBoxDate(); 
	var data = '<request method="time_entry.list"><per_page>100</per_page><date_from>' + entryDate + '</date_from><date_to>' + entryDate + '</date_to></request>';

	//gets existing entries from freshbooks to see if there is a similar one to the current one being made
	freshBooksAPICall({
		data: data,
		success: compareToCurrentEntries,
		onError: function() {
			alert("Error interfacing with the Freshbooks API. Please check the console for more information.");
			errorLog("When: While submitting a time entry to Freshbooks.");
		}
	});
}


// ----------------------------- Button Updating ----------------------------- //

//adds up the hours logged in the pivotal tracker tasks for a specific story
//parameters:
//   -data contains the information recieved after the tasks are listed for a specific story
//   -storyID is passed the storyID of the current button being updated
function sumTimes(data, storyID) {
	var hours = 0, minutes = 0;
	
	$(data).find("task").each(function() {
		var tempString = $($(this).find("description")).text()
		
		if (tempString.substring(0,3) === "#fb") { //#fb is used to identify time entry tasks in pivotal tracker
			var hoursCheck = (/\d+/).exec(tempString.substring(tempString.indexOf("-")));
			var minutesCheck = (/\d+/).exec(tempString.substring(tempString.lastIndexOf(":")));
			
			if (hoursCheck === null || minutesCheck === null) {//figure out way to approach this edge case (maybe set innerHTML as "error"?)
				errorLog("An Error has occured in the tasks section affecting the parsing of #fb tagged tasks.");
				alert("A task in pivotal tracker has been modified and caused an error in the parser.");
			} else {
				hours += parseInt(hoursCheck);
				minutes += parseInt(minutesCheck);
			}
		}
	});
	
	var time = timeToString(hours,minutes);
	
	//if a change in the time shown by the button and the time stored in tasks area was detected
	//the button is adjusted to the newly calculated time
	if (time.toString() === $("#" + timeButtonID(storyID)).text().toString()) {
		return "Same";
	} else {
		$("#" + timeButtonID(storyID)).text(time);
		return "Different";
	}
}

//recalculates the time logged for a specific story
//run if noticed that a specific story is missing a button or if the tasks in a story were manually edited
function recalculateButtonTime(event) {
	var storyID = (/\d+/).exec(event.target.id); //gets the storyID from the id of the button clicked
	var title = document.getElementById("current_itemList_story" + storyID + "_content_icons_editButton").getAttribute('title');
	
	//the button can either cause the story to expand and allow for editing or collapse and save changes
	if (title === "Collapse") { //if the story is being collapsed at the time of the click
		function delayedStoryCheck() { //the call to check pivotal trackers information must be delayed as it occasionally takes a couple seconds for the changes to propogate
			var divs = document.getElementById("current_itemList").getElementsByClassName("storyPreviewButtons")
			var i = divs.length;
			while(i--) { //checks to make sure that the story wasn't deleted, in which case there is no point in checking it
				var existingStoryID = (/\d+/).exec(divs[i].id);
				if (existingStoryID.toString() === storyID.toString()) { 
					$.ajax({
						context: storyID, //need to pass storyID since call is being made asynchronously
						dataType: "xml",   
						url: 'https://www.pivotaltracker.com/services/v3/projects/'+ globalVar['ptProjectID'] +'/stories/'+ storyID + '/tasks',
						type: 'GET',
						beforeSend: function (xhr) {
							xhr.setRequestHeader("X-TrackerToken", globalVar['ptKey']);
						},
						success: function (data) {
							if (sumTimes(data, this.context) === "Different") {
								//can update freshbooks information possibly
							}
						},
						error: function (xhr, textStatus, errorThrown) {
							alert("Error interfacing with the Pivotal Tracker API. Please check the console for more information.");
							errorLog("When: While recalculating the time shown on the button." + "\nxhr: " + xhr + "\ntextStatus: " + textStatus + "\nerrorThrown: " + errorThrown);				
						}
					});
				}
			}
		}
		setTimeout(delayedStoryCheck, 4000); //find better way to make sure changes have propgated to Pivotal Tracker?
	} else if (title === "Expand") {
		function checkForSaveButton() {	//takes time for the saveButton to appear, as this code is run before pivotal tracker creates the new area
			var tempElement = document.getElementById("current_itemList_story" + storyID).getElementsByClassName('buttons')[0];
			
			if (tempElement !== null) {
				tempElement.addEventListener('click', recalculateButtonTime, true);
				window.clearInterval(checkForSaveButtonID);
			}		
		}
		checkForSaveButtonID = window.setInterval(checkForSaveButton, 1000); //checks every second for the save button until it appears
	} else {
		errorLog("Could not find class surrounding save button, will need to update code with new Pivotal Tracker class name.");
	}
}

//updates the information on a button and adds a event listener to the button and the edit button associated with the story
//the data parameter is the list of tasks for a specific story
function updateButtonInfo(data, storyID) {
	document.getElementById("current_itemList_story" + storyID).getElementsByClassName('icons')[0].addEventListener('click', recalculateButtonTime, true);
	document.getElementById(timeButtonID(storyID)).addEventListener("click", openDialog, true);
	sumTimes(data, storyID);	
}

//checks the stories in the current list to see if any of the stories is missing a button
//this needs to be checked as if the status of a story is changed or a story is moved from a different list to the current list
function checkCurrentListButtons() {
	var divs = document.getElementById("current_itemList").getElementsByClassName("storyPreviewButtons");
	var i = divs.length;
	
	while(i--) { //for all the stories in the current list
		var storyID = (/\d+/).exec(divs[i].id); //extracts the storyID of the current one being checked
		
		if (divs[i].firstChild === null || divs[i].firstChild.id !== timeButtonID(storyID)) { //checks if there is no hour logging button
			$("#current_itemList_story"+ storyID + "_content_buttons").prepend('<a style="" href="#" id=' + timeButtonID(storyID) + ' class="stateChangeButton notDblclickable start"></a>');
			$.ajax({ //makes a call to pivotal tracker to get the hours for the button
				context: storyID, //need to pass storyID since call is being made asynchronously
				dataType: "xml",   
				url: 'https://www.pivotaltracker.com/services/v3/projects/'+ globalVar['ptProjectID'] +'/stories/'+ storyID + '/tasks',
				type: 'GET',
				beforeSend: function (xhr) {
					xhr.setRequestHeader("X-TrackerToken", globalVar['ptKey']);
				},
				success: function (data) {
					updateButtonInfo(data, this.context);	
				},
				error: function (xhr, textStatus, errorThrown) {
					alert("Error interfacing with the Pivotal Tracker API. Please check the console for more information.");
					errorLog("When: While adding a button to a story without one." + "\nxhr: " + xhr + "\ntextStatus: " + textStatus + "\nerrorThrown: " + errorThrown);
				}
			});
		}
	}
}


// ----------------------------- Initially Run Functions ----------------------------- //

//this function loads the buttons onto the current list as well as sets the time spent on the story
//this is done by getting information on all the stories from pivotal tracker, running through all
//the stories in the current list and collecting the information for the button
function initialLoad() {
	$('#main').prepend('<div id="dialogHourLog" class="ui-dialog-content ui-widget-content" style="width: auto; min-height: 115px; height: auto; "></div>');
	$('#dialogHourLog').html(setDialogFormat());
	document.getElementById('projectMenu').addEventListener('change', setTaskOptions, true);
	
    $("#ajaxForm").submit(function () {
		cleanDialogBoxTime();
		if (validateDialogBox()) {
			$('#dialogHourLog').dialog('close');
			submitTimeEntry();
		}
		
        return false; //stops page from being reloaded if the submit button is clicked
    });
    
	try{ //creates the dialog box, but does not open it
		$('#dialogHourLog').dialog({
			title : "Time Log",
			modal : true,
			resizable : false,
			autoOpen : false,
			draggable: false
			});
	}
	catch(err) {
		alert('Error creating hour submission form, check console for more details.');
		errorLog(err);
	}
	
	$.ajax({ //gets information from pivotal tracker to create and populate all the hour logging buttons
		dataType: "xml",   
		url: 'https://www.pivotaltracker.com/services/v3/projects/'+globalVar['ptProjectID']+'/stories/',
		type: 'GET',
		beforeSend: function (xhr) {
			xhr.setRequestHeader("X-TrackerToken", globalVar['ptKey']);
		},
		success: function (result) {
			var xml = $(result);
			var divs = document.getElementById("current_itemList").getElementsByClassName("storyPreviewButtons")
			var i = divs.length;
			
			while(i--) { //for all the stories in the current item list
				var storyID = ((/\d+/).exec(divs[i].id)).toString();
				
				$("#current_itemList_story"+ storyID + "_content_buttons").prepend('<a style="" href="#" id=' + timeButtonID(storyID) + ' class="stateChangeButton notDblclickable start"></a>');
				
				$(xml).find('story').each(function () { //really bad way to find the related info, should figure out a better way
					if ($($(this).find('id')[0]).text() === storyID) {		
						updateButtonInfo(this, storyID);						
					}
				});
			}
			window.setInterval(checkCurrentListButtons, 3000); //checks to make sure all the stories in the current item list have a button, this can change if the state of a story changes or a new one is added to the list
		},
		error: function (xhr, textStatus, errorThrown) {
			alert("Error interfacing with the Pivotal Tracker API. Please check the console for more information.");
			errorLog("When: During the initial load of extension" + "\nxhr: " + xhr + "\ntextStatus: " + textStatus + "\nerrorThrown: " + errorThrown);
		}
	});
}

//adds a style into the pivotal tracker page to fix the css that was changed with the jQueryUI library
//now the stories are not faded out when they are collapsed and then expanded
function addGlobalStyle(css) {
    var head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = css;
    head.appendChild(style);
}

//check to see if the initial ajax call made by pivotal tracker has been completed, meaning that all the stories are
//available for edit
function checkForAjaxLoad() {	
	if (document.getElementById('current') !== null) {
		window.clearInterval(globalVar['initialAjaxCheckIntervalID']);
		initialLoad();
		addGlobalStyle('.ui-state-disabled {opacity : 1; }');
		browserSpecificCSSImages();
	}		
}

//checks to make sure that information has been provided for the app to interface with the apis
function validUserCredentials() {
	var missing = "";
	
	//checks through all the variables in globalVar to make sure they all have a value
	for (var i in globalVar) { //should really be iterating through with i to avoid problems with prototype
		if (globalVar[i] === "") {
			missing += "\n  -" + i;
		}
	}
	
	//if there were blank fields, inform the user and do not start the application
	if (missing !== "") {
		alert("Please fill the following fields for the freshbook integration to operate properly:\n" + missing);
		return false;
	}
	
	
	/* could check to make sure that authentication credentials are correct, but couldn't seem to catch the authentication error
	$.ajax({ //gets information from pivotal tracker to create and populate all the hour logging buttons
		dataType: "xml",   
		url: 'https://www.pivotaltracker.com/services/v3/projects/'+globalVar['ptProjectID'],
		type: 'GET',
		beforeSend: function(xhr) {
			xhr.setRequestHeader("X-TrackerToken", globalVar['ptKey']);
		},
		error: function(xhr, textStatus, errorThrown) {
			alert("Please check your Pivotal Tracker Information in main.js, as it did not properly validate.");
			return false;
		}
	});
	
	
	var data = '<request method="time_entry.list"><per_page>1</per_page></request>';
	freshBooksAPICall({
		data: data,
		onError: function() {
				alert("Please check your Freshbooks Information in main.js, as it did not properly validate.");
				return false;
			}
	});*/
	return true;
}

if (validUserCredentials()) {
	globalVar['initialAjaxCheckIntervalID'] = window.setInterval(checkForAjaxLoad, 250);	
}