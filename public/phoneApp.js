
// JavaScript for Phone Application Demo Program
// Jim Skon, Kenyon College, 2017-2018
// THis code using Socket.io to talk to a Node.js programm running on the server.
// The port used for this MUST match the port used on the server side, and must note be a port
// used by anyone else.
var port='8082' // Must match port used on server, port>8000
var host = "localhost"
var operation="";	// operation
var selectid;
var recIndex
var rows;
// Set up events when page is ready
$(document).ready(function () {

	//processResults(message.rows);

	// The Add message is call back after a request to add a new row to the phone directory
	// It creates a modal with the first and last name, and the status (success, failure) from the server.
	//It also clears out the data entered into the add fields
  	if (operation == 'Add') {
  	    $('#modalMessage').text($('#addfirst').val()+" "+$('#addlast').val()+ ": "+message.Status);
  	    $('#modalTitle').text("Record Add");
  	    $('#addchangemodal').modal('show');
  	    $('#addfirst').val("");
  	    $('#addlast').val("");
  	    $('#addphone').val("");
  	    $('#addtype').val("");
  	}
	// The update message is a response after asking the server to update a row.
	// Dispays the status message from the server in a modal
  	if (operation == 'update') {
  	    $('#modalMessage').text($('#editfirst').val()+" "+$('#editlast').val()+ ": "+message.Status);
  	    $('#modalTitle').text("Record Change");
  	    $('#addchangemodal').modal('show');
  	}
	// Displays a message after a record is delected
  	if (operation == 'delete') {
  	    $('#searchresults').text("Deleted: "+rows[recIndex].First+" "+rows[recIndex].Last);
  	}

    operation = "Last"; // Default operation

    // Clear everything on startup
    $('.editdata').hide();
    $("#search-btn").click(getMatches);  // Search button click
    // do a search on every keystroke.
    //$("#search").keyup(function(e){
	//getMatches();
    //});
    $("#add-btn").click(addEntry);    
    $("#clear").click(clearResults);

    //Handle pulldown menu
    $(".dropdown-menu li a").click(function(){
		console.log("Drop!")
		$(this).parents(".btn-group").find('.selection').text($(this).text());
		operation=$(this).text().split(" ").pop();  // Get last word (Last, First, Type, New)
		console.log("pick!"+operation);
		changeOperation(operation);
    });


    
});

// This processes the results from the server after we have sent it a lookup request.
// This clears any previous work, and then calls buildTable to create a nice
// Table of the results, and pushes it to the screen.
// The rows are all saved in "rows" so we can later edit the data if the user hits "Edit"
function processResults(results) {
    $('#editmessage').empty();
    $('#addmessage').empty();
    //console.log("Results:"+results);
    $('#searchresults').empty();
    $('#searchresults').append(buildTable(results));
    rows=results;  // Save everything for delete
    $(".edit").click(processEdit);
    $(".delete").click(DeleteConfirm);
    
}
changeOperation(operation);

// This function is called when an option is selected in the pull down menu
// If the option is "Add New" the shows the add form, and hides the others
// Otherwise it shows the results div
function changeOperation(operation){
    if(operation=="New"){
	$('#addmessage').val("");
	$('.inputdata').show();
	$('.searchbox').hide();
	$('.results').hide();
	$('.editdata').hide();}
    else{
	$('.editdata').hide();
	$('.inputdata').hide();
	$('.results').show();
	$('.searchbox').show();
    }	 
}

// Build output table from comma delimited data list from the server (a list of phone entries)
function buildTable(rows) {
    if (rows.length < 1) {
	return "<h3>Nothing Found</h3>";
    } else {
	var result = '<table class="w3-table-all w3-hoverable" border="2"><tr><th>First</th><th>Last</th><th>Phone</th><th>Type</th><th>Action</th><tr>';
	
	for (var i=0;i<rows.length;i++) {
	    console.log("row:"+JSON.stringify(rows[i]));
	    result += "<tr><td class='first'>"+rows[i].First+"</td><td class='last'>"+rows[i].Last+"</td><td class='phone'>"+rows[i].Phone+"</td><td class='type'>"+rows[i].Type+"</td>";
	    result += "<td><button type='button' ID='"+rows[i].RecNum+"' class='btn btn-primary btn-sm edit'>Edit</button> ";
	    result += "<button type='button' ID='"+rows[i].RecNum+"' Index='"+i+"' class='btn btn-primary btn-sm delete'>Delete</button></td></tr>";
	}
	result += "</table>";
	
	return result;
    }
}
// Called when the user clicks on the Edit button on the results list from a search
// This clears the search  results and shows the edit form, filling it in with the data from the associated record.
// We get the "row" node for $(this) so we have the tight record to edit
// Since this is a result of a button click, we look up the 'ID' of '$(this)' to get the ID of the record to edit
// The record ID is then saved in selectID so we know which record to update with the save button is pushed
// We fill in the edit form with the data from the record from this row.
function processEdit(){
    $('#searchresults').empty();
    $('.editdata').show();
    $("#edit-btn").click(updateEntry);
    //console.log("Edit Record: " + $(this).attr('ID'));
    var row=$(this).parents("tr");
    //console.log("First name of record: "+ $(row).find('.first').text());
    selectid=$(this).attr('ID');
    
    $('#editfirst').val( $(row).find('.first').text());
    $('#editlast').val( $(row).find('.last').text());
    $('#editphone').val( $(row).find('.phone').text());
    $('#edittype').val( $(row).find('.type').text());
}
// This is called when the "Save" button in the edit form is pressed.
// It takes the updated data, and the saves "selectid", and sends the record to the server
// ot update the database.
function updateEntry(){
    //console.log("Edit: Firstname:" + $('#editfirst').val() + "ID:" + selectid);
	$('#searchresults').empty();
	row = {'First': $('#editfirst').val(), "Last": $('#editlast').val(), 
	Phone: $('#editphone').val(), Type: $('#edittype').val(), 'RecNum':selectid};
	console.log("row:"+ JSON.stringify(row));
	$.ajax({
		type: "PUT",
		url: "/phone/update",
		dataType: "json",
		data: JSON.stringify(row),
		success: addDone,
		contentType: "application/json; charset=UTF-8",
        processData: false,
		error: function(err) {
			console.log('Add error',err.message);
		  }
	})
    //socket.emit('message', {
    //	operation: "Update",
    //	First: $('#editfirst').val(),
    //	Last: $('#editlast').val(),
    //	Phone: $('#editphone').val(),
    //	Type: $('#edittype').val(),
    //	RecNum: selectid
    //});	
}

function addDone(status) {
	console.log("add done:", status);
	$('#modalMessage').text($('#addfirst').val()+" "+$('#addlast').val());
	$('#modalTitle').text("Record Add");
	$('#addchangemodal').modal('show');
	$('#modalStatus').text(status);
	$('#addfirst').val("");
	$('#addlast').val("");
	$('#addphone').val("");
	$('#addtype').val("");
}
// This is called when the user hits the "Add button" in the add screen.
// It calls the server with the fields they entered.
function addEntry(){
	$('#searchresults').empty();
	row = {'First': $('#addfirst').val(), "Last": $('#addlast').val(), 
			Phone: $('#addphone').val(), Type: $('#addtype').val() };
	console.log("row:"+ JSON.stringify(row));
	//const URL = "http://"+host+":"+port+"/phone/add";
	$.ajax({
		type: "POST",
		url: "/phone/add",
		dataType: "json",
		data: JSON.stringify(row),
		success: addDone,
		contentType: "application/json; charset=UTF-8",
		processData: false
	}).done(function (status) {addDone(status);});
}
	
// This is called when the user clicks on a "Delete" button on a row matches from a search.
// It puts up a modal asking the user to confirm if they really want to delete this record.  If they
// hit "Delete record", the processDelete function is called to do the delete.
function DeleteConfirm() {
    selectid=$(this).attr('ID');
    recIndex=$(this).attr('index');
    $('#deleteMessage').text("Delete: "+rows[recIndex].First+" "+rows[recIndex].Last+"?");
    $('#deleteconfirm').modal('show');
    $('.completeDelete').click(processDelete);
}
// Calls the server with a recordID of a row to delete
function processDelete(){
    var id=$(this).attr('ID');
    //socket.emit('message', {
    //	operation: "Delete",
    //	RecNum: selectid
    //});	
}

// Clears the search results area on the screen
function clearResults() {
    $('#searchresults').empty();
}

// Called when the user hits the "Search" button.
// It sends a request to the server (operation,search string),
// Where operation is one of (Last, First, Type) 
function getMatches(){
    $('.editdata').hide();
    var search = $('#search').val();
	$('#searchresults').empty();
	$('.results').show();
	const URL = "http://"+host+":"+port+"/phone/"+operation+"/"+search;
	$.get(URL, function(resp,status){
		output=buildTable(resp);
		processResults(resp);
	})
}
	
