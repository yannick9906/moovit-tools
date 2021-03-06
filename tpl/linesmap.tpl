{include file="base.tpl" args=$header}
<main style="height: 100%;width: 100%; position: fixed; top: 0; left: 0; padding: 0; padding-top: 60px;">
    <div style="height: 100%;width:100%; position: relative;" id="map_canvas"></div>
    <div class="card-panel optionspanel">
        <div id="infotextpanel" class="row red-text">

        </div>
        <div id="editorlineslistpanel" class="row">
            <div class="col s12 bolden orange-text text-darken-4">
                Linien
            </div>
            <div class="col s12" style="margin-top: 25px; overflow-y: scroll; max-height: 70vh;">
                <table class="highlight bordered">
                    <tbody id="lineList">
                    <tr><td><i class="grey-text">Keine Linien vorhanden.</i></td></tr>
                    </tbody>
                </table>
            </div>
            <a class="waves-effect waves-light btn right orange col s4 offset-s8" style="margin-top: 25px;" onclick="createNewLine();">Neue Linie</a>
        </div>
        <div id="editorlinesaddpanel" class="row">
            <div class="col s12 bolden orange-text text-darken-4">
                Linie erstellen
            </div>
            <div class="col s12" style="margin-top: 25px;">
                <div class="input-field col s12 m4">
                    <input id="new-nameShort" type="text">
                    <label for="new-nameShort">Linienname Kurz</label>
                </div>
                <div class="input-field col s12 m8">
                    <input id="new-nameLong" type="text">
                    <label for="new-nameLong">Linienname Lang</label>
                </div>
                <div class="input-field col s12 m4">
                    <select id="new-type">
                        <option value="" disabled selected>Typ</option>
                        <option value="0">Bus</option>
                        <option value="1">Tram</option>
                        <option value="2">Zug</option>
                        <option value="3">Gondel</option>
                        <option value="4">U-Bahn</option>
                        <option value="5">Fähre</option>
                        <option value="6">Cablecar</option>
                        <option value="7">Flugzeug</option>
                        <option value="8">Hyperloop</option>
                    </select>
                    <label>Typ</label>
                </div>
                <div class="col s12 m7" style="margin-top: 25px;">
                    <a class="waves-effect waves-light btn right orange" onclick="submitNewLine();">Erstellen</a>
                    <a class="waves-effect waves-red btn-flat right" onclick="backToLines();">Abbrechen</a>
                </div>
            </div>
        </div>
        <div id="editorlineseditpanel" class="row">
            <div class="col s12 bolden orange-text text-darken-4">
                Linie bearbeiten
            </div>
            <div class="col s12" style="margin-top: 25px;">
                <div class="input-field col s12 m3">
                    <input id="edit-nameShort" type="text">
                    <label for="edit-nameShort">Linienname Kurz</label>
                </div>
                <div class="input-field col s12 m9">
                    <input id="edit-nameLong" type="text">
                    <label for="edit-nameLong">Linienname Lang</label>
                </div>
                <div class="input-field col s12 m4" id="edit-type-div">
                    <select id="edit-type">
                        <option value="0">Bus</option>
                        <option value="1">Tram</option>
                        <option value="2">Zug</option>
                        <option value="3">Gondel</option>
                        <option value="4">U-Bahn</option>
                        <option value="5">Fähre</option>
                        <option value="6">Cablecar</option>
                        <option value="7">Flugzeug</option>
                        <option value="8">Hyperloop</option>
                    </select>
                    <label>Typ</label>
                </div>
                <div class="col s12 m8" style="margin-top: 25px;">
                    <a class="waves-effect waves-light btn right orange" onclick="submitEditLine();">Speichern</a>
                    <a class="waves-effect waves-red btn-flat right" onclick="backToLines();">Abbrechen</a>
                </div>
            </div>
            <div class="col s12" style="padding-right: 22px;">
                <a class="waves-effect waves-light btn right orange" onclick="downloadAllAsKML();">KML</a>
                <a class="waves-effect waves-light btn right orange" onclick="createNewTrip();">Neuen Trip erstellen</a>
            </div>
            <div class="col s12" style="margin-top: 25px; overflow-y: scroll; max-height: 40vh;">
                <table class="highlight bordered">
                    <tbody id="tripList">
                    <tr><td><i class="grey-text">Keine Trips vorhanden.</i></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div id="editortripsaddpanel" class="row">
            <div class="col s12 bolden orange-text text-darken-4">
                Trip erstellen
            </div>
            <div class="col s12" style="margin-top: 25px;">
                <div class="input-field col s8">
                    <input id="new-tripname" type="text">
                    <label for="new-tripname">Tripname</label>
                </div>
                <div class="input-field col s4">
                    <select id="new-tripDirection">
                        <option value="" disabled selected>Richtung</option>
                        <option value="0">inbound</option>
                        <option value="1">outbound</option>
                    </select>
                    <label>Richtung</label>
                </div>
            </div>
            <div class="col s12" style="margin-top: 25px;">
                <a class="waves-effect waves-light btn right orange" onclick="submitNewTrip();">Erstellen</a>
                <a class="waves-effect waves-red btn-flat right" onclick="backToLines();">Abbrechen</a>
            </div>
        </div>
        <div id="editortripsaddstationspanel" class="row">
            <div class="col s12 bolden orange-text text-darken-4">
                Trip erstellen
            </div>
            <div class="col s12" id="nextLinks" style="margin-top: 25px;">
                Klicke eine Haltestelle als Startpunkt an.
            </div>
            <div class="col s12" style="margin-top: 25px; overflow-y: scroll; height: 50vh;">
                <table class="highlight bordered">
                    <tbody id="linkList">
                        <tr><td><i class="grey-text">Keine Links vorhanden.</i></td></tr>
                    </tbody>
                </table>
            </div>
            <div class="col s12" style="margin-top: 25px;">
                <a class="waves-effect waves-light btn right orange" onclick="submitTrip();">Erstellen</a>
            </div>
        </div>
        <div id="editortripseditpanel" class="row">
            <div class="col s12 bolden orange-text text-darken-4">
                Trip bearbeiten
            </div>
            <div class="col s12" style="margin-top: 25px;">
                <div class="input-field col s8">
                    <input id="edit-tripname" type="text">
                    <label for="edit-tripname">Tripname</label>
                </div>
                <div class="input-field col s4">
                    <select id="edit-tripDirection">
                        <option value="" disabled selected>Richtung</option>
                        <option value="0">inbound</option>
                        <option value="1">outbound</option>
                    </select>
                    <label>Richtung</label>
                </div>
            </div>
            <div class="col s12" style="margin-top: 25px;">
                <a class="waves-effect waves-light btn right orange" onclick="submitEditTrip();">Speichern</a>
                <a class="waves-effect waves-light btn right orange" onclick="downloadAsKML();">KML</a>
                <a class="waves-effect waves-light btn right btn-flat" onclick="backToLine();">Abbrechen</a>
            </div>
        </div>
    </div>
</main>
<script src="https://cdn.rawgit.com/eligrey/FileSaver.js/e9d941381475b5df8b7d7691013401e171014e89/FileSaver.min.js"></script>
<script src="https://unpkg.com/leaflet@1.0.2/dist/leaflet.js"></script>
<script src="lib/awesome-markers/leaflet.awesome-markers.js"></script>
<script src="lib/leaflet.polylineDecorator.js"></script>
<script src="lib/leaflet.Editable.js"></script>
<script src="js/linesmap.js"></script>
{include file="end.tpl"}