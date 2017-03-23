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
<tr class="showHand">
    <td onclick="editLine({{id}})"><i class="mddi mddi-{{icon}} iconname"></i><b class="shortname">{{shortName}}</b></td><td onclick="editLine({{id}})"> {{longName}}</td>
    <td>
        <a id="delL{{id}}" onclick="delLine({{id}})" href="#!" style="padding-left:10px;padding-right:10px;" class="btn-flat right red-text"><i class="mddi mddi-delete"></i></a>
        <a id="denydelL{{id}}" onclick="denyLinedelete({{id}})" href="#!" style="padding-left:10px;padding-right:10px;display:none;" class="btn-flat right red-text"><i class="mddi mddi-close"></i></a>
        <a id="confdelL{{id}}" onclick="confLinedelete({{id}})" href="#!" style="padding-left:10px;padding-right:10px;display:none;" class="btn-flat right green-text"><i class="mddi mddi-check"></i></a>
    </td>
</tr>
    `;
const templateLines = Handlebars.compile(lineListTempl);

//// Trip List Template
const tripListTempl = `
<tr class="showHand">
    <td onclick="editTrip({{id}})" >{{id}}:<b> {{name}}</b><br/>-> {{destination}}</td><td onclick="editTrip({{id}})" >{{direction}}</td>
    <td>
        <a id="delT{{id}}" onclick="delTrip({{id}})" href="#!" style="padding-left:10px;padding-right:10px;" class="btn-flat right red-text"><i class="mddi mddi-delete"></i></a>
        <a id="denydelT{{id}}" onclick="denyTripdelete({{id}})" href="#!" style="padding-left:10px;padding-right:10px;display:none;" class="btn-flat right red-text"><i class="mddi mddi-close"></i></a>
        <a id="confdelT{{id}}" onclick="confTripdelete({{id}})" href="#!" style="padding-left:10px;padding-right:10px;display:none;" class="btn-flat right green-text"><i class="mddi mddi-check"></i></a>
    </td>
</tr>
    `;
const templateTrips = Handlebars.compile(tripListTempl);

//// Trip Links Template
const tripLinksTempl = `
<tr>
    <td><b>{{id}}:</b> {{destination}}</td>
</tr>
    `;
const templateLinks = Handlebars.compile(tripLinksTempl);

////////////////////////////////////////////////////////////////////
// Variables ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
let map;
let markers = [];
let idToMarker = {};
let idBefore = [];
let pathLine;
let pathLatLngs = [];
let polylines = [];
let links = [];
let currEdit = -1;
let currMarkerPos = -1;
let currEditLink = -1;
let currID = -1;
let currentLine = 0;
let currentTrip = "";
let currentTripLatLngs = [];
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
    $.getJSON("api/users/getProjectCoords.php",null,function(json) {
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
                maxZoom: 17,
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

        map = L.map('map_canvas', {editable: true}).setView([json.lat, json.lng], 12);
        L.control.layers(baseMaps).addTo(map);
        map.addLayer(osmStreet);

        map.on("moveend", function () {
            if ((new Date().getTime()) - lastMove >= 750) {
                refreshStops();
                lastMove = new Date().getTime();
            }
        });
        map.on("zoomend", function () {
            if ((new Date().getTime()) - lastMove >= 750) {
                refreshStops();
                lastMove = new Date().getTime();
            }
        });
        refreshStops();
        backToLines();
    });
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
            thismarker.on('click', function () {
                startStationLinks(e.id, e.name + " " + e.code);
            });
            markers.push(thismarker);
            idToMarker[i+"h"] = e.id;
        });
    });
}

function loadLines() {
    $.getJSON("../api/lines/getList.php?sort=nameAsc&page=1",null,function(json) {
        $("#lineList").html("");
        json['lines'].forEach(function(e, i, a) {
            let types = {'Bus':"bus",'Tram':"tram", 'Zug':'train', 'Gondel':'gondola', 'U-Bahn':'subway-variant', 'Fähre':'ferry', 'Flugzeug':'airplane', 'Hyperloop':'infinity', 'Cablecar':'tram'};
            let icon = types[e['type']]
            $("#lineList").append(templateLines({icon: icon, id: e['id'], shortName: e['nameShort'], longName: e['nameLong']}))
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
    $("#editortripsaddstationspanel").hide();
    $("#editortripseditpanel").hide();

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
        currentLine = json['nameShort'];

        $.getJSON("../api/trips/getTripsForLine.php?id="+id, null, function(json)  {
            if(json['trips'].length != 0) {
                $("#tripList").html("");
                json['trips'].forEach(function(e, i, a) {
                    let direction = "inbound";
                    if(e['direction'] == 1) direction = "outbound";
                    $("#tripList").append(templateTrips({id: e['id'], name: e['name'], direction: direction, destination: e['destination']}));
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

function delLine(id) {
    $("#delL"+id).hide();
    $("#confdelL"+id).show();
    $("#denydelL"+id).show();
}

function confLinedelete(id) {
    $("#delL"+id).show();
    $("#confdelL"+id).hide();
    $("#denydelL"+id).hide();
    let data = {
        id: id
    };
    $.getJSON("../api/lines/remove.php",data,function(json) {
        if (json.success == "1") {
            Materialize.toast("Linie gelöscht", 2000, "green");
            backToLines();
            $("#editortripseditpanel").hide();
        } else {
            Materialize.toast("Fehler", 2000, "red");
        }
    });
}

function denyLinedelete(id) {
    $("#delL"+id).show();
    $("#confdelL"+id).hide();
    $("#denydelL"+id).hide();
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
    let data = {
        name: $("#new-tripname").val(),
        lID: currEdit,
        direction: $("#new-tripDirection").val()
    };
    $.post("api/trips/create.php", data, function (response) {
        let json = JSON.parse(response);
        if (json.success == "1") {
            Materialize.toast("Trip erstellt", 2000, "green");
            currEditLink = json.id;
            links = [];
            idBefore = [];
            pathLatLngs = [];
            $("#editortripsaddpanel").hide();
            $("#editortripsaddstationspanel").show();
        } else {
            if (json.error == "missing fields") {
                Materialize.toast("Bitte alle Felder ausfüllen", 2000, "red");
            }
        }
    });
}

function delTrip(id) {
    $("#delT"+id).hide();
    $("#confdelT"+id).show();
    $("#denydelT"+id).show();
}

function confTripdelete(id) {
    $("#delT"+id).show();
    $("#confdelT"+id).hide();
    $("#denydelT"+id).hide();
    let data = {
        id: id
    };
    $.getJSON("../api/trips/remove.php",data,function(json) {
        if (json.success == "1") {
            Materialize.toast("Trip gelöscht", 2000, "green");
            editLine(currEdit);
            $("#editortripseditpanel").hide();
        } else {
            Materialize.toast("Fehler", 2000, "red");
        }
    });
}

function denyTripdelete(id) {
    $("#delT"+id).show();
    $("#confdelT"+id).hide();
    $("#denydelT"+id).hide();
}

function startStationLinks(stationID, stationName) {
    if(currEditLink != -1 && pathLatLngs.length == 0) {
        loadLinksFor(stationID);
        $("#linkList").html(templateLinks({id:"Start",destination: stationName}))
    }
}

function loadLinksFor(stationID) {
    currID = stationID;
    for (let i = 0; i < polylines.length; i++ ) {
        map.removeLayer(polylines[i]);
    }
    polylines.length = 0;

    pathLine = L.polyline(pathLatLngs,{
        color: "red",
        opacity: 1

    });
    pathLine.addTo(map);
    let pathDecorator = L.polylineDecorator(pathLine,{
        patterns: [
            {offset: 75, repeat: 75, symbol: L.Symbol.arrowHead({pixelSize:12, pathOptions:{color: "red"}})}
        ]
    });

    pathDecorator.addTo(map);
    polylines.push(pathLine);
    polylines.push(pathDecorator);

    $.getJSON("api/stationlinks/getLinkForStation.php?id="+stationID,null, function(json) {
        let list = json["links"];
        $("#nextLinks").html("Folgende Links sind von hier verfügbar: <br/>");
        if(list.length == 0) {
            $("#nextLinks").html("<br/> Keine Links von dieser Station aus vorhanden.<br/><a onclick='loadLinksFor("+stationID+")' class='btn btn-flat'><i class='mddi mddi-refresh'></i>Neu laden</a>");
        }
        list.forEach(function (e) {
            //Draw Polyline Preview
            let color = generateRandomColor();
            const path = JSON.parse(e.path);
            let latlngs = [];
            path.forEach(function(e) {
                latlngs.push([e.lat, e.lng]);
            });
            let line = L.polyline(latlngs,{
                color: color,
                opacity: 1

            });
            line.addTo(map);
            let decorator = L.polylineDecorator(line,{
                patterns: [
                    {offset: 75, repeat: 75, symbol: L.Symbol.arrowHead({pixelSize:12, pathOptions:{color: color}})}
                ]
            });

            decorator.addTo(map);
            polylines.push(line);
            polylines.push(decorator);

            $("#nextLinks").append("<a onclick='addLink("+e['id']+",\""+JSON.stringify(latlngs)+"\")' class='btn orange'>"+e['toStation']['name']+" "+e['toStation']['code']+"</a>");
        });
        $("#nextLinks").append("<br/><br/><a onclick='removeLastLink()' class='btn btn-flat'>Zurück</a>");

    });
}

function addLink(lnkID, path) {
    links.push(lnkID);
    idBefore.push(currID);
    console.log(JSON.parse(path));
    pathLatLngs.push(JSON.parse(path));
    $.getJSON("../api/stationlinks/details.php?id="+lnkID,null,function(json) {
        let endStationID = json["toStation"]["id"];
        $("#linkList").append(templateLinks({id:endStationID, destination: "-> "+json["toStation"]["name"]+" "+json["toStation"]["code"]}))
        loadLinksFor(endStationID);
    });
}

function removeLastLink() {
    if(idBefore.length != 0) {
        links.pop();
        pathLatLngs.pop();
        loadLinksFor(idBefore.pop())
    } else {
        pathLatLngs.length = 0;
        links.length = 0;
    }
}

function submitTrip() {
    let data = {
        path: JSON.stringify(links)
    }
    $.post("../api/trips/update.php?id="+currEditLink, data, function(e) {
        let json = JSON.parse(e);
        if (json.success == "1") {
            Materialize.toast("Trip erstellt", 2000, "green");
            $("#editortripsaddpanel").hide();
            $("#editortripsaddstationspanel").hide();
            $("#linkList").html("");
            $("#nextLinks").html("");
            let currEditBkp = currEdit;

            for (let i = 0; i < polylines.length; i++ ) {
                map.removeLayer(polylines[i]);
            }
            polylines.length = 0;
            pathLatLngs.length = 0;
            links.length = 0;
            idBefore.length = 0;
            currEditLink = -1;

            backToLines();
            editLine(currEditBkp);
        } else {
            if (json.error == "missing fields") {
                Materialize.toast("Bitte alle Felder ausfüllen", 2000, "red");
            }
        }
    });
}

function editTrip(id) {
    $("#editorlineseditpanel").hide();
    $("#editortripsaddpanel").hide();
    $("#editortripsaddstationspanel").hide();
    $("#editortripseditpanel").show();

    currEditLink = id;
    $.getJSON("../api/trips/details.php?id="+id,null,function(json) {
        $("#edit-tripname").val(json['name']);
        $("#edit-tripDirection").val(parseInt(json['direction'])).change();
        $('select').material_select();
        Materialize.updateTextFields();

        currentTrip = json['name'];
    });

    $.getJSON("../api/trips/getPath.php?id="+id, null, function(json) {

        const color = "red";
        const path = JSON.parse(json.path);
        let latlngs = [];
        path.forEach(function(e) {
            latlngs.push([e.lat, e.lng]);
        });
        currentTripLatLngs = latlngs;
        let line = L.polyline(latlngs,{
            color: color,
            opacity: 1

        });
        line.addTo(map);
        let decorator = L.polylineDecorator(line,{
            patterns: [
                {offset: 75, repeat: 75, symbol: L.Symbol.arrowHead({pixelSize:12, pathOptions:{color: color}})}
            ]
        });

        decorator.addTo(map);
        polylines.push(line);
        polylines.push(decorator);
    });
}

function backToLine() {
    currEditLink = -1;
    for (let i = 0; i < polylines.length; i++ ) {
        map.removeLayer(polylines[i]);
    }
    polylines.length = 0;
    $("#editortripseditpanel").hide();
    editLine(currEdit);
}

function submitEditTrip() {
    let data = {
        name: $("#edit-tripname").val(),
        direction: $("#edit-tripDirection").val()
    }
    $.post("../api/trips/update.php?id="+currEditLink, data, function(e) {
        let json = JSON.parse(e);
        if (json.success == "1") {
            Materialize.toast("Trip aktualisiert", 2000, "green");
            backToLine();
        } else {
            if (json.error == "missing fields") {
                Materialize.toast("Bitte alle Felder ausfüllen", 2000, "red");
            }
        }
    })
}

function downloadAsKML() {
    let tosave = "<?xml version='1.0' encoding='UTF-8'?><kml xmlns='http://www.opengis.net/kml/2.2'><Document><Placemark><name>Linie "+currentLine+": "+currentTrip+"</name><description><![CDATA[Moovittool Export &copy;2016-17 Yannick F&#233;lix]]></description><LineString><coordinates>\n";
    currentTripLatLngs.forEach(function(e) {
        tosave += e[1]+","+e[0]+"\n";
    });
    tosave += "</coordinates> </LineString> </Placemark></Document></kml>";
    var blob = new Blob([tosave], {type: "application/vnd.google-earth.kml+xml;charset=utf-8"});
    saveAs(blob, "line"+currentLine+"-"+currentTrip+".kml");
}

function downloadAllAsKML() {
    //Todo
    saveAs(blob, "line"+currentLine+"-complete.kml");
}