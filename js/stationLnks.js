/**
 * Created by yanni on 29.09.2016.
 */

///////////////////////////////////////////////////////////////////////
var listElemTmplt = `
    <tr id="row-{{i}}" style="display: none;" href="stationLinkEdit.php?id={{id}}">
        <td>{{id}}</td>
        <td>{{from}} -> {{to}}</td>
    </tr>
    `;
var template = Handlebars.compile(listElemTmplt);
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
var searchString = "";
var currPage = 1;
var reqPage = 1;
var maxPages = 1;
var size = 0;
var sort = "ascID";
var data = "";
var currEdit = -1;
var stationPos;
var marker;
var map;
var updating = true;
///////////////////////////////////////////////////////////////////////

function setPage(apage) {
    reqPage = apage;
}

function updatePages() {
    if(currPage > maxPages) reqPage = maxPages;
    if(reqPage == 0) reqPage = 1;

    var nextPage = parseInt(currPage)+1;
    var prevPage = currPage-1;
    var p = $("#pages");
    p.html("");
    p.append("<div id='pagesPre' class='col s1'></div>");
    p.append("<div id='pagesSuf' class='col push-s10 s1'></div>");
    p.append("<div id='pagesNum' class='col pull-s1 s10'></div>");

    if(currPage <= 1) $("#pagesPre").append("<li class=\"disabled\"><a><i class=\"material-icons\">chevron_left</i></a></li>");
    else $("#pagesPre").append("<li class=\"waves-effect\"><a onclick=\"setPage("+prevPage+")\"><i class=\"material-icons\">chevron_left</i></a></li>");

    for(var i = 1; i <= maxPages; i++) {
        if(i != currPage) {
            $("#pagesNum").append("<li class=\"waves-effect\"><a onclick=\"setPage("+i+")\">"+i+"</a></li>");
        } else {
            $("#pagesNum").append("<li class=\"active indigo\"><a onclick=\"setPage("+i+")\">"+i+"</a></li>");
        }
    }

    if(currPage >= maxPages) $("#pagesSuf").append("<li class=\"disabled\"><a><i class=\"material-icons\">chevron_right</i></a></li>");
    else $("#pagesSuf").append("<li class=\"waves-effect\"><a onclick=\"setPage("+nextPage+")\"><i class=\"material-icons\">chevron_right</i></a></li>");
}

function updateData() {
    sort = $("#sort").val();
    $.getJSON("api/stationlinks/getList.php?page="+reqPage+"&sort="+sort+"&search="+searchString,null, function(json) {
        maxPages = json['maxPage'];
        currPage = json['page'];
        size = json['size'];
        var list = json['links'];

        if(JSON.stringify(list) != data) {
            $("#stations").html("");
            list.forEach(function (e, i, a) {
                $("#stations").append(template({i: i,id: e.id, from: e.fromStation.name, to: e.toStation.name}))
                size = i;
            });
            animate(0);
            data = JSON.stringify(list);
        }
        updatePages();
    });
}

function animate(i) {
    if(i <= size) {
        $("#row-"+i).fadeIn(50);
        window.setTimeout("animate("+(i+1)+")", 25);
    }
}

function updateCaller() {
    if(updating) {
        updateData();
        updatePages();
    }
    window.setTimeout("updateCaller()", 2500);
}

///////////////////////////////////////
function backToList() {
    $("#stationForm").fadeOut(200, function() {
        $("#stationList").fadeIn(200);
        $("#stationList").show();
    });
    updating = true;
    currEdit = -1;
}

function newStation() {
    $("#autocomplete-startstation").val("");
    $("#autocomplete-endstation").val("");
    $("#stationLnkList").fadeOut(200, function() {
        $("#linkForm").fadeIn(200);
        updating = false;
    });
}

function submitNewLink() {
    data = {
        startStation: $("#autocomplete-startstation").val(),
        endStation: $("#autocomplete-endstation").val()
    };
    $.post("../api/stationlinks/create.php", data, function(response) {
        var json = JSON.parse(response);
        if(json.success == "1") {
            Materialize.toast("Stationlink erstellt", 2000, "green");
            backToList();
        } else {
            if(json.error == "missing fields") {
                Materialize.toast("Bitte alle Felder ausfüllen", 2000, "red");
            }
        }
    });
}

///////////////////////////////////////

var delay = (function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();

$(document).ready(function() {
    window.setTimeout("updateCaller()", 500);
    $("#filter").keyup(function () {
        delay(function(){
            searchString = $("#filter").val();
            data = "";
            reqPage = 1;
            updateData();
            updatePages();
        }, 500 );
    });
    $.getJSON("api/stations/getSimpleList.php",null, function(json) {
        $('input.autocomplete').autocomplete({
            data: json.stations
        });
    });
});