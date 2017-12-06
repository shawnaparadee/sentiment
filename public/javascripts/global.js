
$(document).ready(function () {
    // get current url
    var url = window.location.href;
    
    // data
    var methods = [
        ['POST', 'projects', '/projects', 'Get all records from the project table.', 
            '<b>databaseId</b> (integer) - the id of the database in the config.js file to connect to</br>']
    ];
    
    
    var tableContent = '';
    // for each item in our method, add a table row and cells to the content string
    $.each(methods, function (idx, method) {
        
        var params = method[4] != null ? method[4] : '';
        tableContent += '<tr>';
        tableContent += '<td>' + method[0] + ' ' + method[1] + '</td>';
        if (method[0] == 'GET')
            tableContent += '<td><a href="' + url + method[2] + '" target="_blank">' + url + method[2] + '<a/></td>';
        else
            tableContent += '<td>' + url + method[2] + '</td>';
        tableContent += '<td>' + method[3] + '</td>';
        tableContent += '<td>' + params + '</td>';
        tableContent += '</tr>';
    });
    
    // inject table part constructed above into the table in #apiMethod
    // section of jade view (./view/homepage.jade)
    $('#apiMethods table tbody').html(tableContent);
});
