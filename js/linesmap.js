/**
 * Created by yanni on 14.12.2016.
 */

//// Info Window Template
const infoWindowTempl = `
    <div id="content">
      <span id="firstHeading" class="bolden orange-text text-darken-2">{{name}} {{code}}</span>
      <div id="bodyContent">
      <span class="grey-text text-lighten-1">Lat: {{lat}}<br/>Lon: {{lon}}</span><br/>
      <span class="btn orange" onclick="listStationLinks({{id}}, {{markerpos}})">Station Links</span>
      <span class="btn orange">Linien</span>
      </div>
      </div>
    `;
const template = Handlebars.compile(infoWindowTempl);

//// Line List Template
const lineListTempl = `
<tr onclick="editLine({{id}})">
    <td><b>{{shortName}}:</b> {{longName}}</td>
</tr>
    `;
const templateLines = Handlebars.compile(lineListTempl);

//// Trip List Template
const tripListTempl = `
<tr onclick="editTrip({{id}})">
    <td>{{id}}:<b> {{name}}</b></td><td>{{direction}}</td>
</tr>
    `;
const templateTrips = Handlebars.compile(tripListTempl);

////////////////////////////////////////////////////////////////////
// Variables ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
let map;
let markers = [];
let idToMarker = {};
let polylineBackup;
let polylines = [];
let stationPos;
let currEdit = -1;
let currMarkerPos = -1;
let currEditLink = -1;
let lastMove = new Date().getTime();

////////////////////////////////////////////////////////////////////
// Map Init ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////


$(document).ready(function() {
    $('select').material_select();
    initMap();
});

function componentToHex(c) {
    let hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function generateRandomColor(mix) {
    let red = getRandomInt(0,256);
    let green = getRandomInt(0,256);
    let blue = getRandomInt(0, 256);

    // mix the color
    if (mix != null) {
        red = (red + mix[0]) / 2;
        green = (green + mix[1]) / 2;
        blue = (blue + mix[2]) / 2;
    }


    return "#" + componentToHex(red) + componentToHex(green) + componentToHex(blue);
}

function initMap() {
    //stationPos = new google.maps.LatLng(50, 8.3);
    const streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoieWFubmljazk5IiwiYSI6ImNpeDF6bmRtZjAwMHUyb3NicXg1YXJmbGwifQ.k6lN8qn7o7AHFzl2lKq1xA', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 20,
            minZoom: 2
        }),
        satellite = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoieWFubmljazk5IiwiYSI6ImNpeDF6bmRtZjAwMHUyb3NicXg1YXJmbGwifQ.k6lN8qn7o7AHFzl2lKq1xA', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 20,
            minZoom: 2
        }),
        osmStreet = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 19,
            minZoom: 2
        }),
        osmÖpnv = L.tileLayer('http://www.openptmap.org/tiles/{z}/{x}/{y}.png', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 18,
            minZoom: 2
        }),
        googleHybrid = L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
            attribution: 'Map data &copy; <a href="http://maps.google.com">Google Maps</a> contributors',
            maxZoom: 21,
            minZoom: 2
        });

    const baseMaps = {
        "Mapbox Hybrid": satellite,
        "Mapbox Straße": streets,
        "OSM Straße": osmStreet,
        "OSM ÖPNV": osmÖpnv,
        "Google Maps Hybrid": googleHybrid
    };

    map = L.map('map_canvas', {editable: true}).setView([50, 8.3], 12);
    L.control.layers(baseMaps).addTo(map);
    map.addLayer(osmStreet);

    map.on("moveend", function() {
        if(currEdit == -1)
            if((new Date().getTime())-lastMove >= 750) {
                refreshStops();
                lastMove = new Date().getTime();
            }
    });
    map.on("zoomend", function() {
        if(currEdit == -1)
            if((new Date().getTime())-lastMove >= 750) {
                refreshStops();
                lastMove = new Date().getTime();
            }
    });
    refreshStops();
    backToLines();
}

function refreshStops() {
    if(map.getZoom() <= 14) return;
    for (let i = 0; i < markers.length; i++ ) {
        map.removeLayer(markers[i]);
    }
    markers.length = 0;
    idToMarker.length = 0;
    const data = {
        boundALat: map.getBounds().getNorthEast().lat,
        boundALng: map.getBounds().getNorthEast().lng,
        boundBLat: map.getBounds().getSouthWest().lat,
        boundBLng: map.getBounds().getSouthWest().lng
    };
    $.getJSON("api/stations/getMap.php",data, function(json) {
        let list = json['stations'];
        list.forEach(function (e, i) {
            let icon = L.AwesomeMarkers.icon({
                icon: 'bus',
                markerColor: 'blue'
            });
            let thismarker = L.marker(
                L.latLng(parseFloat(e['posLat']), parseFloat(e['posLon'])),
                {title: (e.name + " " + e.code), icon: icon}
            );
            thismarker.addTo(map);
            thismarker.on('click', startStationLinks(e.id));
            markers.push(thismarker);
            idToMarker[i+"h"] = e.id;
        });
    });
}

function loadLines() {
    $.getJSON("../api/lines/getList.php?sort=nameAsc&page=1",null,function(json) {
        $("#lineList").html("");
        json['lines'].forEach(function(e, i, a) {
            $("#lineList").append(templateLines({id: e['id'], shortName: e['nameShort'], longName: e['nameLong']}))
        });
    });
}

function hideList(x) {
    $("#editorlineslistpanel").hide();
}

function backToLines() {
    currEdit = -1;
    currMarkerPos = -1;
    $("#editorlinesaddpanel").hide();
    $("#editorlineseditpanel").hide();
    $("#editortripsaddpanel").hide();

    loadLines();
    $("#editorlineslistpanel").show();
}

////////////////////////////////////////////////////////////////////
// Create Line /////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function createNewLine() {
    if(currEdit == -1) {
        hideList();
        currEdit = -2;
        $("#editorlinesaddpanel").show();
        $("#new-nameShort").val("");
        $("#new-nameLong").val("");
        $("#new-type").val("");
        Materialize.updateTextFields();
    }
}

function submitNewLine() {
    data = {
        nameShort: $("#new-nameShort").val(),
        nameLong: $("#new-nameLong").val(),
        type: $("#new-type").val()
    };
    $.post("../api/lines/create.php", data, function(response) {
        let json = JSON.parse(response);
        if(json.success == "1") {
            Materialize.toast("Line erstellt", 2000, "green");
            backToLines();
        } else {
            if(json.error == "missing fields") {
                Materialize.toast("Bitte alle Felder ausfüllen", 2000, "red");
            }
        }
    });
}

////////////////////////////////////////////////////////////////////
// Edit Line ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function editLine(id) {
    hideList();
    currEdit = id;
    $.getJSON("../api/lines/details.php?id="+id,null, function(json) {
        $("#editorlineseditpanel").show();
        $("#edit-nameShort").val(json['nameShort']);
        $("#edit-nameLong").val(json['nameLong']);
        $("#edit-type").val(parseInt(json['typeID'])).change();
        $('select').material_select();
        Materialize.updateTextFields();


        $.getJSON("../api/trips/getTripsForLine.php?id="+id, null, function(json)  {
            if(json['trips'].length != 0) {
                $("#tripList").html("");
                json['trips'].forEach(function(e, i, a) {
                    let direction = "inbound";
                    if(e['direction'] == 1) direction = "outbound";
                    $("#tripList").append(templateTrips({id: e['id'], name: e['name'], direction: direction}));
                });
            } else {
                $("#tripList").html("<tr><td><i class=\"grey-text\">Keine Trips vorhanden.</i></td></tr>");
            }
        });
    });
}


function submitEditLine() {
    data = {
        nameShort: $("#edit-nameShort").val(),
        nameLong: $("#edit-nameLong").val(),
        type: $("#edit-type").val()
    };
    $.post("api/lines/update.php?id=" + currEdit, data, function (response) {
        let json = JSON.parse(response);
        if (json.success == "1") {
            Materialize.toast("Linie aktualisiert", 2000, "green");
            backToLines();
        } else {
            if (json.error == "missing fields") {
                Materialize.toast("Bitte alle Felder ausfüllen", 2000, "red");
            }
        }
    });
}

////////////////////////////////////////////////////////////////////
// Trips  //////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function createNewTrip() {
    $("#editorlineseditpanel").hide();
    $("#editortripsaddpanel").show();
    $("#new-tripName").hide();
    $("#new-tripDirection").hide();
    Materialize.updateTextFields();
}

function submitNewTrip() {
    data = {
        name: $("#new-tripName").val(),
        lID: currEdit,
        direction: $("#new-tripDirection").val()
    };
    $.post("api/trips/create.php", data, function (response) {
        let json = JSON.parse(response);
        if (json.success == "1") {
            Materialize.toast("Trip erstellt", 2000, "green");
            $("#editortripsaddpanel").hide();
            $("#editor")
        } else {
            if (json.error == "missing fields") {
                Materialize.toast("Bitte alle Felder ausfüllen", 2000, "red");
            }
        }
    });
}