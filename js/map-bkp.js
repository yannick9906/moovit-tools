/**
 * Created by yanni on 14.12.2016.
 */

//// Info Window Template
var infoWindowTempl = `
    <div id="content">
      <span id="firstHeading" class="bolden orange-text text-darken-2">{{name}} {{code}}</span>
      <div id="bodyContent">
      <span class="grey-text text-lighten-1">Lat: {{lat}}<br/>Lon: {{lon}}</span><br/>
      <span class="btn orange" onclick="listStationLinks({{id}}, {{markerpos}});">Station Links</span>
      <span class="btn orange">Linien</span>
      </div>
      </div>
    `;
var template = Handlebars.compile(infoWindowTempl);

//// Station Link List Template
var stationLinkListTempl = `
<span>
    <span onclick="editLink({{id}})" class="btn orange"><i class="mddi mddi-pencil"></i></span>
    {{id}}: -> <span class="bolden">{{endStation}}</span>
</span>
<br/>
    `;
var templateLnks = Handlebars.compile(stationLinkListTempl);

////////////////////////////////////////////////////////////////////
// Variables ///////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////
var map;
var markers = [];
var idToMarker = {};
var infos = [];
var polylines = [];
var stationPos;
var currEdit = -1;
var currMarkerPos = -1;
var currEditLink = -1;
var importRectangle;
var lastMove = new Date().getTime();

////////////////////////////////////////////////////////////////////
// Map Init ////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////


$(document).ready(function() {

});

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function generateRandomColor(mix) {
    var red = getRandomInt(0,256);
    var green = getRandomInt(0,256);
    var blue = getRandomInt(0,256);

    // mix the color
    if (mix != null) {
        red = (red + mix[0]) / 2;
        green = (green + mix[1]) / 2;
        blue = (blue + mix[2]) / 2;
    }


    return "#" + componentToHex(red) + componentToHex(green) + componentToHex(blue);
}

function initMap() {
    stationPos = new google.maps.LatLng(50, 8.3);
    var mapTypeIds = [];
    for(var type in google.maps.MapTypeId) {
        mapTypeIds.push(google.maps.MapTypeId[type]);
    }
    mapTypeIds.push("OSM");
    mapTypeIds.push("OSM-öpnv");
    mapTypeIds.push("MQS");

    var mapOptions = {
        center: new google.maps.LatLng(50, 8.3),
        zoom: 12,
        mapTypeId: "OSM",
        mapTypeControlOptions: {
            mapTypeIds: mapTypeIds
        },
        streetViewControl: false
    };

    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    map.mapTypes.set("OSM", new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            var tilesPerGlobe = 1 << zoom;
            var x = coord.x % tilesPerGlobe;
            if (x < 0) {
                x = tilesPerGlobe+x;
            }
            return "https://a.tile.openstreetmap.org/" + zoom + "/" + x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OpenStreetMap",
        maxZoom: 18
    }));
    map.mapTypes.set("OSM-öpnv", new google.maps.ImageMapType({
        getTileUrl: function(coord, zoom) {
            var tilesPerGlobe = 1 << zoom;
            var x = coord.x % tilesPerGlobe;
            if (x < 0) {
                x = tilesPerGlobe+x;
            }
            return "http://a.tile2.opencyclemap.org/transport/" + zoom + "/" + x + "/" + coord.y + ".png";
        },
        tileSize: new google.maps.Size(256, 256),
        name: "OSM ÖPNV",
        maxZoom: 18
    }));
    google.maps.event.addDomListener(window, "resize", function() {
        var center = map.getCenter();
        google.maps.event.trigger(map, "resize");
        map.setCenter(center);
    });

    map.addListener("dragend", function(event) {
        if(currEdit == -1)
            if((new Date().getTime())-lastMove >= 750) {
                hideAll()
                lastMove = new Date().getTime();
            }
    });
    map.addListener("zoom_changed", function(event) {
        if(currEdit == -1)
            if((new Date().getTime())-lastMove >= 750) {
                hideAll()
                lastMove = new Date().getTime();
            }
    });
    postInit();
}

function postInit() {
    map.setCenter(stationPos);

    google.maps.event.addListener(map, "rightclick", function(event) {
        //Map Rightclick
        addStation(event.latLng.lat(), event.latLng.lng());
    });
    google.maps.event.addListener(map, "click", function(event) {
        //Map LeftClick
        closeInfoWindows();
    });

    hideAll();
}

function getStations() {
    var data = {
        boundALat: map.getBounds().getNorthEast().lat(),
        boundALng: map.getBounds().getNorthEast().lng(),
        boundBLat: map.getBounds().getSouthWest().lat(),
        boundBLng: map.getBounds().getSouthWest().lng()
    }
    $.getJSON("api/stations/getMap.php",data, function(json) {
        var list = json['stations'];
        list.forEach(function (e, i, a) {
            var infowindow = new google.maps.InfoWindow({
                content: template({i: i,id: e.id, name: e.name, code: e.code, lat: e.posLat, lon: e.posLon, markerpos: i})
            });
            var thismarker = new google.maps.Marker({
                position: {lat: parseFloat(e.posLat), lng: parseFloat(e.posLon)},
                title: (e.name + " " + e.code),
                label: e.code,
                map: map
            });
            thismarker.addListener('click', function() {
                closeInfoWindows();
                infowindow.open(map, thismarker);
            });
            thismarker.addListener('rightclick', function() {
                if(currEdit == -1) editStation(e.id, i);
            });
            markers.push(thismarker);
            idToMarker[i+"h"] = e.id;
            infos.push(infowindow)
        });
    });
}

function hideAll() {
    for (var i = 0; i < markers.length; i++ ) {
        markers[i].setMap(null);
    }
    markers.length = 0;
    idToMarker.length = 0;
    for (var i = 0; i < polylines.length; i++ ) {
        polylines[i].setMap(null);
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
}

function closeInfoWindows() {
    for (var i = 0; i < infos.length; i++ ) {
        infos[i].close();
    }
}

////////////////////////////////////////////////////////////////////
// Create Station //////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function addStation(lat, lon) {
    if(currEdit == -1) {
        hideAll();
        $("#newstationpanel").show();
        $("#new-stationName").val("");
        $("#new-stationCode").val("");
        $("#new-stationLat").val(lat);
        $("#new-stationLon").val(lon);
        stationPos = new google.maps.Marker({
            position: {lat: lat, lng: lon},
            map: map,
            draggable: true
        });
        stationPos.addListener('dragend', function (event) {
            $("#new-stationLat").val(stationPos.position.lat());
            $("#new-stationLon").val(stationPos.position.lng());
        });
        markers.push(stationPos);
        Materialize.updateTextFields();
    }
}

function submitNewStation() {
    data = {
        stationName: $("#new-stationName").val(),
        stationCode: $("#new-stationCode").val(),
        lat: stationPos.position.lat(),
        lon: stationPos.position.lng()
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
    hideAll();
}

////////////////////////////////////////////////////////////////////
// Edit Station ////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function editStation(id, markerpos) {
    //hideAll();
    currEdit = id;
    currMarkerPos = markerpos;
    $.getJSON("../api/station/details.php?id="+id,null, function(json) {
        $("#editstationpanel").show();
        $("#edit-stationName").val(json.name);
        $("#edit-stationCode").val(json.code);
        $("#edit-stationLat").val(parseFloat(json.posLat));
        $("#edit-stationLon").val(parseFloat(json.posLon));
        marker = markers[markerpos];
        console.log(marker)
        marker.setDraggable(true);
        //marker.setIcon('http://maps.google.com/mapfiles/ms/icons/green-dot.png');
        marker.setIcon('http://icons.iconarchive.com/icons/paomedia/small-n-flat/48/map-marker-icon.png');
        marker.setLabel("");
        marker.addListener('dragend', function (event) {
            $("#edit-stationLat").val(marker.position.lat());
            $("#edit-stationLon").val(marker.position.lng());
        });
        Materialize.updateTextFields();
    });
}


function submitEditStation() {
    data = {
        stationName: $("#edit-stationName").val(),
        stationCode: $("#edit-stationCode").val(),
        lat: markers[currMarkerPos].position.lat(),
        lon: markers[currMarkerPos].position.lng()
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
    hideAll();
}

////////////////////////////////////////////////////////////////////
// Station Links ///////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////

function listStationLinks(stationID, markerpos) {
    if(currEdit == -1) {
        currEdit = stationID;
        currMarkerPos = markerpos;
        marker = markers[markerpos];
        marker.setIcon('http://icons.iconarchive.com/icons/paomedia/small-n-flat/48/map-marker-icon.png');
        marker.setLabel("");
        closeInfoWindows();
        $("#stationlnkspanel").show();

        $.getJSON("api/stationlinks/getLinkForStation.php?id="+currEdit,null, function(json) {
            var list = json["links"];
            $("#lnkStart").html(" hier.");
            $("#lnkList").html("<i class='grey-text text-lighten-2'>Keine Station Links, welche von dieser Haltestelle ausgehen, gefunden.</i><br/><br/>");
            if(list.length != 0) $("#lnkList").html("<br/>");
            list.forEach(function (e, i, a) {
                $("#lnkStart").html(e.fromStation.name+" "+e.fromStation.code);
                $("#lnkList").append(templateLnks({id: e.id, endStation: e.toStation.name+" "+e.toStation.code}));
                //Draw Polyline Preview
                var path = JSON.parse(e.path);
                var line = new google.maps.Polyline({
                    path: path,
                    geodesic: true,
                    strokeColor: generateRandomColor(),
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                    icons: [{
                        icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW},
                        repeat: '50px'
                    }],
                    map: map
                });
                polylines.push(line);
            });
            $("#lnkList").append("<br/>");
        });
    }
}

function backToLinks() {
    for (var i = 0; i < polylines.length; i++ ) {
        polylines[i].setMap(null);
    }
    polylines.length = 0;
    $("#stationlnkeditpanel").hide();
    $("#stationlnknewpanel").hide();
    $("#stationlnkspanel").show();
    var currEditBkp = currEdit;
    currEdit = -1;
    listStationLinks(currEditBkp,currMarkerPos);
}

function editLink(id) {
    currEditLink = id;
    $("#stationlnkspanel").hide();
    $("#stationlnkeditpanel").show();
    $.getJSON("api/stationlinks/details.php?id="+id,null, function(json) {
        var path = JSON.parse(json["path"]);
        $("#stationLinkName").html("<br/>von <b>"+json.fromStation.name+" "+json.fromStation.code+"</b><br/> nach <b>"+json.toStation.name+" "+json.toStation.code+"</b><br/><br/>");

        for (var i = 0; i < polylines.length; i++ ) {
            polylines[i].setMap(null);
        }
        polylines.length = 0;

        var line = new google.maps.Polyline({
            path: path,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            editable: true,
            icons: [{
                icon: {path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW},
                repeat: '50px'
            }],
            map: map
        });

        //Disable first an last vertex
        google.maps.event.addListener(line, 'mousedown', function (event) {
            var thePath = this.getPath();
            if (event.vertex === 0 || event.vertex === thePath.getLength() - 1) {
                this.set('editable',false);
                this.set('editable',true);
            }
        });
        polylines.push(line);
    });
}

function submitEditLink() {
    path = polylines[0].getPath().getArray();
    console.log(path);
    data = {
        path: JSON.stringify(path)
    };
    $.post("../api/stationlinks/update.php?id="+currEditLink, data, function(response) {
        var json = JSON.parse(response);
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
    $("#stationlnkspanel").hide();
    $("#stationlnknewpanel").show();
    for (var i = 0; i < polylines.length; i++ ) {
        polylines[i].setMap(null);
    }
    polylines.length = 0;
    $("#stationLinkName").html("<br/><b>Bitte eine Haltestelle als Ende auswählen...</b><br/><br/>");
    for (var i = 0; i < markers.length; i++ ) {
        markers[i].addListener('click', function (event) {
            submitNewLink(event.latLng);
        });
    }
}

function submitNewLink(latLng) {
    var id = -1;
    for (var i = 0; i < markers.length; i++ ) {
        if(markers[i].position.equals(latLng)) {
            id = idToMarker[i+"h"];
            break;
        }
    }
    data = {
        startStation: currEdit,
        endStation: id
    };
    $.post("../api/stationlinks/create.php", data, function(response) {
        var json = JSON.parse(response);
        if(json.success == "1") {
            Materialize.toast("Stationlink erstellt", 2000, "green");
            hideAll();
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
    $("#importStationsStart").hide();
    $("#importStations").show();
    importRectangle = new google.maps.Rectangle({
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
    });
}

function showCoordinates() {
    var biggerLat = importRectangle.getBounds().getNorthEast().lat();
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
    $("#coordinates").html(JSON.stringify(data));
}

function importStations() {
    var data = $("#stops").val();
    data = JSON.parse(data);
    var stops = data[4]["0"]["lst"];

}