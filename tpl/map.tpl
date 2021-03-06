{include file="base.tpl" args=$header}
<main style="height: 100%;width: 100%; position: fixed; top: 0; left: 0; padding: 60px 0 0; right: 0;">
    <div style="height: 100%;width:100%; position: relative; right: 0;" id="map_canvas"></div>
    <div class="card-panel optionspanel">
        <div id="infotextpanel" class="row red-text">

        </div>
        <div id="editortipspanel" class="row">
            <div class="col s12 bolden orange-text text-darken-4">
                Editor
            </div>
            <p class="col s12">
                <input id="fileInput" type="file" style="display:none;" onchange="importStations(event)"/>
                <button id="btnload" class="btn orange waves-effect waves-light col s3"
                        onclick="document.getElementById('fileInput').click();" type="button">
                    <i class="mddi mddi-upload"></i> Import
                </button><br/><br/>
                <span class="bolden">Rechtsklick: </span>Neue Haltestelle erstellen<br/>
                <span class="bolden">Rechtsklick auf Haltestelle: </span>Haltestelle bearbeiten<br/>
                <span class="bolden">Linksklick auf Haltestelle: </span>Haltestellenoptionen anzeigen<br/>
            </p>
        </div>
        <div id="newstationpanel" class="row">
            <div class="col s12 bolden orange-text text-darken-4">
                Haltestelle erstellen
            </div>
            <div class="input-field col s8">
                <input id="new-stationName" type="text">
                <label for="new-stationName">Haltestellenname</label>
            </div>
            <div class="input-field col s4">
                <input id="new-stationCode" type="text">
                <label for="new-stationCode">Haltestellencode</label>
            </div>
            <div class="input-field col s6">
                <input id="new-stationLat" type="text" disabled value=".">
                <label for="new-stationLat">Position: Breite</label>
            </div>
            <div class="input-field col s6">
                <input id="new-stationLon" type="text" disabled value=".">
                <label for="new-stationLon">Position: Länge</label>
            </div>
            <a class="waves-effect waves-light btn orange right" onclick="submitNewStation();">OK</a>
            <a class="waves-effect waves-red btn-flat right" onclick="hideAll(1);">abbrechen</a>
        </div>
        <div id="editstationpanel" class="row">
            <div class="col s12 bolden orange-text text-darken-4">
                Haltestelle bearbeiten
            </div>
            <div class="input-field col s8">
                <input id="edit-stationName" type="text">
                <label for="edit-stationName">Haltestellenname</label>
            </div>
            <div class="input-field col s4">
                <input id="edit-stationCode" type="text">
                <label for="edit-stationCode">Haltestellencode</label>
            </div>
            <div class="input-field col s6">
                <input id="edit-stationLat" type="text" disabled value=".">
                <label for="edit-stationLat">Position: Breite</label>
            </div>
            <div class="input-field col s6">
                <input id="edit-stationLon" type="text" disabled value=".">
                <label for="edit-stationLon">Position: Länge</label>
            </div>
            <a class="waves-effect waves-light btn orange right" onclick="submitEditStation();">OK</a>
            <a class="waves-effect waves-red btn-flat right" onclick="hideAll(1);">abbrechen</a>
            <a class="waves-effect waves-red btn-flat right red-text" onclick="removeStation();">LÖSCHEN</a>
        </div>
        <div id="stationlnkspanel" class="row">
            <div class="col s12 bolden orange-text text-darken-4">
                Station Links von <i id="lnkStart"></i>
            </div>
            <div id="lnkList" class="col s12">

            </div>
            <a class="waves-effect waves-red btn-flat right" onclick="hideAll(1);">OK</a>
            <a class="waves-effect waves-light btn right orange" onclick="createNewLink();">Neu erstellen</a>
        </div>
        <div id="stationlnkeditpanel" class="row">
            <div class="col s12 bolden orange-text text-darken-4">
                Station Link bearbeiten
            </div>
            <div id="stationLinkName" class="col s12"></div>
            <br/>
            <a class="waves-effect waves-light btn right orange" onclick="submitEditLink();">Speichern</a>
            <a class="waves-effect waves-red btn-flat right" onclick="backToLinks();">Abbrechen</a>
        </div>
        <div id="stationlnknewpanel" class="row">
            <div class="col s12 bolden orange-text text-darken-4">
                Station Link erstellen
            </div>
            <p class="col s12">
                Der Link startet <i>hier.</i><br/>
                <span class="bolden">Rechtsklick</span> auf Zielstation, um den Link zu erstellen
            </p>
            <div id="stationLinkNewName" class="col s12"></div>
            <br/>
            <a class="waves-effect waves-light btn right orange" onclick="submitEditLink();">Speichern</a>
            <a class="waves-effect waves-red btn-flat right" onclick="backToLinks();">Abbrechen</a>
        </div>
        <div id="importStations" class="row">
            <div class="progress col s12">
                <div class="determinate" style="width: 0%" id="stationImportProgress"></div>
            </div>
            <p class="col s12" id="stationImportList" style="margin-top: 25px; overflow-y: scroll; max-height: 40vh;">

            </p>
        </div>
    </div>
</main>
<script src="https://unpkg.com/leaflet@1.0.2/dist/leaflet.js"></script>
<script src="lib/awesome-markers/leaflet.awesome-markers.js"></script>
<script src="lib/leaflet.polylineDecorator.js"></script>
<script src="lib/leaflet.Editable.js"></script>
<script src="js/map.js"></script>
<!--<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBV0Ll8dkPpMbS5xrTtgqHukmFd8x2FU5M&callback=initMap"></script>
-->
{include file="end.tpl"}