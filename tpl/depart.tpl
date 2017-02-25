{include file="base.tpl" args=$header}
<main>
    <div class="container row">
        <div class="card-panel col s12 row" id="options">
            <br/>
            <div class="input-field col s2">
                <input id="line_no" type="text">
                <label for="line_no">Linie</label>
            </div>
            <div class="input-field col s2">
                <select id="direction">
                    <option value="inbound" selected>-></option>
                    <option value="outbound"><-</option>
                </select>
                <label>Richtung</label>
            </div>
            <div class="input-field col s2">
                <select id="day">
                    <option value="MoFr" selected>Mo-Fr</option>
                    <option value="Sa">Sa</option>
                    <option value="So">So</option>
                </select>
                <label>Tag</label>
            </div>
            <div class="col s6">
                <input id="fileInput" type="file" style="display:none;" onchange="load(event)"/>
                <button id="btnload" class="btn orange waves-effect waves-light"
                        onclick="document.getElementById('fileInput').click();" type="button">
                    <i class="mddi mddi-upload"></i> Laden
                </button>
                <button id="btnsave" class="btn orange waves-effect waves-light" onclick="save()" type="button">
                    <i class="mddi mddi-content-save"></i> Speichern
                </button>
                <button id="btnCalcTrips" class="btn orange waves-effect waves-light col s3" onclick="calcTripTypes()"
                        type="button">
                    <i class="mddi mddi-calculator"></i> Trips berechnen
                </button>
            </div>
        </div>
        <div class="card-panel col s12" style="overflow: scroll">
            <div class="" id="times">
                <table class="centered striped">
                    <thead>
                    <tr>
                        <th>Name</th>
                    </tr>
                    </thead>
                    <tbody id="timeTable" style="padding-top: 0; padding-bottom: 0;"></tbody>
                </table>
                <button id="btnAddPage" class="btn orange waves-effect waves-light col s3" onclick="addPage()"
                        type="button">
                    <i class="mddi mddi-plus"></i> Seite
                </button>
                <button id="btnFillAll" class="btn orange waves-effect waves-light col s3" onclick="fillUpAll()"
                        type="button">
                    <i class="mddi mddi-basket-fill"></i> Alles füllen
                </button>
                <div class="input-field col s12">
                    <textarea id="addPageInput" class="materialize-textarea"></textarea>
                    <label for="addPageInput">Seite hinzufügen</label>
                </div>
            </div>
            <div id="tripTypes">
                <p id="types">

                </p>
                <button id="btnBackPlan" class="btn orange waves-effect waves-light col s3" onclick="backToTable()"
                        type="button">
                    <i class="mddi mddi-arrow-left"></i> Fahrplan
                </button>
            </div>
            <div id="intervalTypes">
                <pre id="intervals">

                </pre>
                <pre id="intervalTimes">

                </pre>
                <button id="btnBackTrip" class="btn orange waves-effect waves-light col s3" onclick="backToTrips()"
                        type="button">
                    <i class="mddi mddi-arrow-left"></i> Triptypes
                </button>
            </div>
        </div>

    </div>
</main>
<script src="js/depart.js"></script>
{include file="end.tpl"}