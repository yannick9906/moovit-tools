/**
 * Created by yanni on 2017-03-05.
 */

$(document).ready(function() {
    fillSelects();
    $("#selActProj").change(function(e) {
        let id = "";
        let name = "";
        $( "select option:selected" ).each(function() {
            id = $(this).val();
            name = $(this).text();
        });
        $.getJSON("api/users/changeActiveProject.php?prID="+id,null, function(json) {
            if(json.success == "true") {
                Materialize.toast(name+" ist jetzt aktiv.", 1000, "green");
                $("#projectname").html(name);
            } else {
                Materialize.toast(json.error, 2000, "green");
            }
        });
    });
});

function fillSelects() {
    $.getJSON("api/users/getProjects.php",null, function(json) {
        for(let i = 0; i < json.projects.length; i++) {
            $("#selActProj").append("<option "+((parseInt(json.active)==parseInt(json.projects[i].id))?"selected ":"")+"value=\""+json.projects[i].id+"\">"+json.projects[i].name+"</option>")
        }
        $('select').material_select();
    });
}