/**
 * Created by yanni on 29.09.2016.
 */

var filterName = "#filterCurr";
var sortName = "#sortCurr";
var linkList = "getLists.php?action=citizenSimple";
var linkDetail = "citizen.php?action=citizeninfosimple";
var pagesize = 12;
///////////////////////////////////////////////////////////////////////
var listElemTmplt = `
    <tr id="row-{{i}}" style="display: none;" onclick="editStation({{id}})">
        <td>{{id}}</td>
        <td>{{name}} {{code}}</td>
        <td><span class="grey-text text-lighten-1">Lat: {{lat}}<br/>Lon: {{lon}}</span></td>
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
    $.getJSON("api/stations/getList.php?page="+reqPage+"&sort="+sort+"&search="+searchString,null, function(json) {
        maxPages = json['maxPage'];
        currPage = json['page'];
        size = json['size'];
        var list = json['stations'];

        if(JSON.stringify(list) != data) {
            $("#stations").html("");
            list.forEach(function (e, i, a) {
                $("#stations").append(template({i: i,id: e.id, name: e.name, code: e.code, lat: e.posLat, lon: e.posLon}))
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
    $("#new-stationName").val("");
    $("#new-stationCode").val("");
    postInit();
    $("#stationList").fadeOut(200, function() {
        $("#newStationBtns").show();
        $("#newStationFields").show();
        $("#newStationTitle").show();
        $("#editStationBtns").hide();
        $("#editStationFields").hide();
        $("#editStationTitle").hide();
        $("#stationForm").fadeIn(200);
        updating = false;
    });
}

function submitNewStation() {
    data = {
        stationName: $("#new-stationName").val(),
        stationCode: $("#new-stationCode").val(),
        lat: stationPos.lat(),
        lon: stationPos.lng()
    };
    $.post("../api/stations/create.php", data, function(response) {
        var json = JSON.parse(response);
        if(json.success == "1") {
            Materialize.toast("Haltestelle erstellt", 2000, "green");
            backToList();
        } else {
            if(json.error == "missing fields") {
                Materialize.toast("Bitte alle Felder ausfüllen", 2000, "red");
            }
        }
    });
}

function editStation(id) {
    currEdit = id;
    $.getJSON("../api/station/details.php?id="+id,null, function(json) {
        $("#stationList").fadeOut(200, function() {
            $("#newStationBtns").hide();
            $("#newStationFields").hide();
            $("#newStationTitle").hide();
            $("#editStationBtns").show();
            $("#editStationFields").show();
            $("#editStationTitle").show();
            $("#stationForm").fadeIn(200);
            $("#edit-stationName").val(json.name);
            $("#edit-stationCode").val(json.code);
            stationPos = new google.maps.LatLng(parseFloat(json.posLat), parseFloat(json.posLon));
            postInit();
            Materialize.updateTextFields();
            updating = false;
        });
    })
}

function submitEditStation() {
    data = {
        stationName: $("#edit-stationName").val(),
        stationCode: $("#edit-stationCode").val(),
        lat: stationPos.lat(),
        lon: stationPos.lng()
    };

    $.post("api/stations/update.php?id="+currEdit, data, function(response) {
        var json = JSON.parse(response);
        if(json.success == "1") {
            Materialize.toast("Haltestelle aktualisiert", 2000, "green");
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

function initMap() {
    stationPos = new google.maps.LatLng(50, 8.3);
    var mapOptions = {
        center: new google.maps.LatLng(50, 8.3),
        zoom: 12
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
    });
    postInit();
}

function postInit() {
    try {
        marker.setPosition(stationPos);
    } catch(e) {
        marker = new google.maps.Marker({
            position: stationPos,
            map: map,
            draggable: true
        });
    }

    map.setCenter(stationPos);

    google.maps.event.addListener(marker, 'dragend', function () {
        stationPos = marker.getPosition();
    });
}

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
});