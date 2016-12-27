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

//// Station Link List Template
const stationLinkListTempl = `
<span>
    <span onclick="editLink({{id}})" class="btn orange"><i class="mddi mddi-pencil"></i></span>
    {{id}}: -> <span class="bolden">{{endStation}}</span>
</span>
<br/>
    `;
const templateLnks = Handlebars.compile(stationLinkListTempl);

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
                hideAll(1);
                lastMove = new Date().getTime();
            }
    });
    map.on("zoomend", function() {
        if(currEdit == -1)
            if((new Date().getTime())-lastMove >= 750) {
                hideAll(1);
                lastMove = new Date().getTime();
            }
    });
    map.on("contextmenu", function(event) {
        //Map Rightclick
        addStation(event.latlng.lat, event.latlng.lng);
    });
    hideAll(true);
}

function getStations() {
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
            thismarker.on('click', function() {
                thismarker.bindPopup(template({i: i,id: e['id'], name: e['name'], code: e['code'], lat: e['posLat'], lon: e['posLon'], markerpos: i})).openPopup();
            });
            thismarker.on('contextmenu', function() {
                if(currEdit == -1) editStation(e['id'], i);
            });
            markers.push(thismarker);
            idToMarker[i+"h"] = e.id;

            /*$.getJSON("api/stationlinks/getLinkForStation.php?id="+e.id,null, function(json) {
                let list = json["links"];
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
                });
            });*/
        });
    });
}

function hideAll(x) {
    for (let i = 0; i < markers.length; i++ ) {
        map.removeLayer(markers[i]);
    }
    markers.length = 0;
    idToMarker.length = 0;
    for (let i = 0; i < polylines.length; i++ ) {
        map.removeLayer(polylines[i]);
    }
    polylines.length = 0;
    currEdit = -1;
    currMarkerPos = -1;
    if(map.getZoom() >= 15) getStations();
    $("#newstationpanel").hide();
    $("#editstationpanel").hide();
    $("#stationlnkspanel").hide();
    $("#stationlnkeditpanel").hide();
    $("#stationlnknewpanel").hide();
    $("#importStations").hide();
    $("#importStationsStart").hide();
    $("#editortipspanel").hide();
    if(x == 1) $("#editortipspanel").show();
}

////////////////////////////////////////////////////////////////////
// Create Station //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function addStation(lat, lng) {
    if(currEdit == -1) {
        hideAll();
        $("#newstationpanel").show();
        $("#new-stationName").val("");
        $("#new-stationCode").val("");
        $("#new-stationLat").val(lat);
        $("#new-stationLon").val(lng);
        let icon = L.AwesomeMarkers.icon({
            icon: 'bus',
            markerColor: 'red'
        });
        stationPos = L.marker(L.latLng(lat, lng),{icon:icon});
        stationPos.on('dragend', function () {
            $("#new-stationLat").val(stationPos.getLatLng().lat);
            $("#new-stationLon").val(stationPos.getLatLng().lng);
        });
        stationPos.addTo(map);
        markers.push(stationPos);
        Materialize.updateTextFields();
    }
}

function submitNewStation() {
    data = {
        stationName: $("#new-stationName").val(),
        stationCode: $("#new-stationCode").val(),
        lat: stationPos.getLatLng().lat,
        lon: stationPos.getLatLng().lng
    };
    $.post("../api/stations/create.php", data, function(response) {
        let json = JSON.parse(response);
        if(json.success == "1") {
            Materialize.toast("Haltestelle erstellt", 2000, "green");
            hideAll(1);
        } else {
            if(json.error == "missing fields") {
                Materialize.toast("Bitte alle Felder ausfüllen", 2000, "red");
            }
        }
    });
}

////////////////////////////////////////////////////////////////////
// Edit Station ////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function editStation(id, markerpos) {
    $("#editortipspanel").hide();
    currEdit = id;
    currMarkerPos = markerpos;
    $.getJSON("../api/station/details.php?id="+id,null, function(json) {
        $("#editstationpanel").show();
        $("#edit-stationName").val(json.name);
        $("#edit-stationCode").val(json.code);
        $("#edit-stationLat").val(parseFloat(json['posLat']));
        $("#edit-stationLon").val(parseFloat(json['posLon']));
        marker = markers[markerpos];
        console.log(marker);
        marker.dragging.enable();
        let icon = L.AwesomeMarkers.icon({
            icon: 'check',
            markerColor: 'red'
        });
        marker.setIcon(icon);
        marker.on('dragend', function () {
            $("#edit-stationLat").val(marker.getLatLng().lat);
            $("#edit-stationLon").val(marker.getLatLng().lng);
        });
        Materialize.updateTextFields();
    });
}


function submitEditStation() {
    data = {
        stationName: $("#edit-stationName").val(),
        stationCode: $("#edit-stationCode").val(),
        lat: markers[currMarkerPos].getLatLng().lat,
        lon: markers[currMarkerPos].getLatLng().lng
    };

    $.post("api/stations/update.php?id=" + currEdit, data, function (response) {
        let json = JSON.parse(response);
        if (json.success == "1") {
            Materialize.toast("Haltestelle aktualisiert", 2000, "green");
            hideAll(1);
        } else {
            if (json.error == "missing fields") {
                Materialize.toast("Bitte alle Felder ausfüllen", 2000, "red");
            }
        }
    });
}

////////////////////////////////////////////////////////////////////
// Station Links ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function listStationLinks(stationID, markerpos) {
    if(currEdit == -1) {
        currEdit = stationID;
        currMarkerPos = markerpos;
        marker = markers[markerpos];
        let icon = L.AwesomeMarkers.icon({
            icon: 'check',
            markerColor: 'red'
        });
        marker.setIcon(icon);
        $("#editortipspanel").hide();
        $("#stationlnkspanel").show();

        $.getJSON("api/stationlinks/getLinkForStation.php?id="+currEdit,null, function(json) {
            let list = json["links"];
            $("#lnkStart").html(" hier.");
            $("#lnkList").html("<i class='grey-text text-lighten-2'>Keine Station Links, welche von dieser Haltestelle ausgehen, gefunden.</i><br/><br/>");
            if(list.length != 0) $("#lnkList").html("<br/>");
            list.forEach(function (e) {
                $("#lnkStart").html(e['fromStation']['name']+" "+e['fromStation']['code']);
                $("#lnkList").append(templateLnks({id: e['id'], endStation: e['toStation']['name']+" "+e['toStation']['code']}));
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
            });
            $("#lnkList").append("<br/>");
        });
    }
}

function backToLinks() {
    for (let i = 0; i < polylines.length; i++ ) {
        map.removeLayer(polylines[i])
    }
    polylines.length = 0;
    $("#stationlnkeditpanel").hide();
    $("#stationlnknewpanel").hide();
    $("#stationlnkspanel").show();
    let currEditBkp = currEdit;
    currEdit = -1;
    listStationLinks(currEditBkp,currMarkerPos);
}

function editLink(id) {
    currEditLink = id;
    $("#editortipspanel").hide();
    $("#stationlnkspanel").hide();
    $("#stationlnkeditpanel").show();
    $.getJSON("api/stationlinks/details.php?id="+id,null, function(json) {
        let path = JSON.parse(json["path"]);
        $("#stationLinkName").html("<br/>von <b>"+json['fromStation']['name']+" "+json['fromStation']['code']+"</b><br/> nach <b>"+json['toStation']['name']+" "+json['toStation']['code']+"</b><br/><br/>");
        let latlngs = [];
        path.forEach(function(e) {
            latlngs.push([e.lat, e.lng]);
        });
        for (let i = 0; i < polylines.length; i++ ) {
            map.removeLayer(polylines[i]);
        }
        polylines.length = 0;

        let line = L.polyline(path, {
            color: 'red',
            opacity: 1
        });
        line.addTo(map);
        line.enableEdit();
        line.on("editable:editing", function() {
            let path = line.getLatLngs();
            if(!path[0].equals(polylineBackup[0]) || !path[path.length - 1].equals(polylineBackup[polylineBackup.length - 1])) {
                console.log("Disabled.");
                path[0] = polylineBackup[0];
                path[path.length - 1] = polylineBackup[polylineBackup.length - 1];
                line.setLatLngs(path);
                line.disableEdit();
                line.enableEdit();
                $("#infotextpanel").html("Um den ersten oder letzten Punkt eines Links zu ändern, bitte die Position der Haltestelle ändern.");
                window.setTimeout(function() {
                    $("#infotextpanel").html("");
                }, 5000);
            }
        });

        polylines.push(line);
        polylineBackup = latlngs;
    });
}

function submitEditLink() {
    let latlngs = polylines[0].getLatLngs();
    let path = [];
    latlngs.forEach(function(e) {
        path.push({lat:e.lat, lng:e.lng});
    });
    data = {
        path: JSON.stringify(path)
    };
    $.post("../api/stationlinks/update.php?id="+currEditLink, data, function(response) {
        let json = JSON.parse(response);
        if(json.success == "1") {
            Materialize.toast("Stationlink gespeichert", 2000, "green");
            backToLinks();
        } else {
            if(json.error == "missing fields") {
                Materialize.toast("Bitte alle Felder ausfüllen", 2000, "red");
            }
        }
    });
}

function createNewLink() {
    $("#editortipspanel").hide();
    $("#stationlnkspanel").hide();
    $("#stationlnknewpanel").show();
    for (let i = 0; i < polylines.length; i++ ) {
        map.removeLayer(polylines[i]);
    }
    polylines.length = 0;
    $("#stationLinkName").html("<br/><b>Bitte eine Haltestelle als Ende auswählen...</b><br/><br/>");
    for (let i = 0; i < markers.length; i++ ) {
        markers[i].on('click', function(event) {
            submitNewLink(event.latlng);
        });
    }
}

function submitNewLink(latLng) {
    let id = -1;
    for (let i = 0; i < markers.length; i++ ) {
        if(markers[i].getLatLng().equals(latLng)) {
            id = idToMarker[i+"h"];
            break;
        }
    }
    data = {
        startStation: currEdit,
        endStation: id
    };
    $.post("../api/stationlinks/create.php", data, function(response) {
        let json = JSON.parse(response);
        if(json.success == "1") {
            Materialize.toast("Stationlink erstellt", 2000, "green");
            hideAll(1);
        } else {
            if(json.error == "missing fields") {
                Materialize.toast("Bitte alle Felder ausfüllen", 2000, "red");
            }
        }
    });
}

////////////////////////////////////////////////////////////////////
// Import Stations /////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function importStationsStart() {
    $("#editortipspanel").hide();
    $("#importStationsStart").hide();
    $("#importStations").show();
    /*importRectangle = new google.maps.Rectangle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        map: map,
        editable: true,
        bounds: {
            north: 50.008,
            south: 49.992,
            east: 8.266,
            west: 8.249
        }
    });*/
}

function showCoordinates() {
    /*var biggerLat = importRectangle.getBounds().getNorthEast().lat();
    var biggerLng = importRectangle.getBounds().getNorthEast().lng();
    var smallerLat = importRectangle.getBounds().getSouthWest().lat();
    var smallerLng = importRectangle.getBounds().getSouthWest().lng();
    var data = [
        1,
        "getStopsInRegion",
        1,
        0,
        {
            1: {i32: 2527},
            2: {
                rec: {
                    1: {dbl: biggerLat},
                    2: {dbl: smallerLng}
                }
            },
            3: {
                rec: {
                    1: {dbl: smallerLat},
                    2: {dbl: biggerLng}
                }
            }
        }
    ]
    $("#coordinates").html(JSON.stringify(data));*/
}

function importStations() {
    let data = $("#stops").val();
    data = JSON.parse(data);
    let stops = data[4]["0"]["lst"];
}