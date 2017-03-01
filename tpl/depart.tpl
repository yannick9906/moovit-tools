{include file="base.tpl" args=$header}
<main>
    <div class="container row">
        <div class="card-panel col s12 row" id="options">
            <br/>
            <span class="col s12 bolden orange-text text-darken-4">Optionen</span>
            <div class="input-field col s2">
                <input id="line_no" type="text">
                <label for="line_no">Linie</label>
            </div>
            <div class="input-field col s1">
                <select id="direction">
                    <option value="inbound" selected>-></option>
                    <option value="outbound"><-</option>
                </select>
                <label>Richtung</label>
            </div>
            <div class="input-field col s1">
                <select id="day">
                    <option value="MoFr" selected>Mo-Fr</option>
                    <option value="Sa">Sa</option>
                    <option value="So">So</option>
                </select>
                <label>Tag</label>
            </div>
            <div class="input-field col s2">
                <select id="type">
                    <option value="mvg" selected>Mainz - MVG</option>
                    <option value="lvb">Leipzig - LVB</option>
                </select>
                <label>Fahrplantyp</label>
            </div>
            <div class="col s6 row">
                <input id="fileInput" type="file" style="display:none;" onchange="load(event)"/>
                <button id="btnload" class="btn orange waves-effect waves-light col s3"
                        onclick="document.getElementById('fileInput').click();" type="button">
                    <i class="mddi mddi-upload"></i> load
                </button>
                <button id="btnsave" class="btn orange waves-effect waves-light col s3" onclick="save()" type="button">
                    <i class="mddi mddi-content-save"></i> save
                </button>
                <button id="btnCalcTrips" class="btn orange waves-effect waves-light col s3" onclick="calcTripTypes()"
                        type="button">
                    <i class="mddi mddi-calculator"></i> trips
                </button>
                <button id="btnTogglePage" class="btn orange waves-effect waves-light col s2" onclick="togglePage()"
                        type="button">
                    <i class="mddi mddi-minus-box"></i> close
                </button>
            </div>
        </div>
        <div class="card-panel col s12 row" id="addPage">
            <div class="input-field col s12">
                <textarea id="addPageInput" class="materialize-textarea"></textarea>
                <label for="addPageInput">Text Input</label>
            </div>
            <button id="btnAddPage" class="btn orange waves-effect waves-light col s2 right" onclick="addPage()" style="margin-bottom: 10px;"
                    type="button">
                <i class="mddi mddi-plus"></i> page
            </button>
        </div>
    </div>
    <div class="card-panel col s12" style="overflow: scroll; max-height: 70vh; margin-top: -10px;">
        <div class="" id="times">
            <table class="centered striped">
                <thead>
                </thead>
                <tbody id="timeTable" style="padding-top: 0; padding-bottom: 0;">
                </tbody>
            </table>
            <div style="position: fixed; top:0; left: 0; z-index: 99;" id="fl_menu">
                <button id="btnAddSpace" class="btn orange waves-effect waves-light col s3" onclick="actionAddSpaces()"
                        type="button">
                    <i class="mddi mddi-plus"></i>
                </button>
                <button id="btnRemSpace" class="btn orange waves-effect waves-light col s3" onclick="actionRemoveSpaces()"
                        type="button">
                    <i class="mddi mddi-minus"></i>
                </button>
                <button id="btnAddSpacedSpace" class="btn orange waves-effect waves-light col s3" onclick="actionAddSpacedSpaces()"
                        type="button">
                    <i class="mddi mddi-debug-step-over"></i>
                </button>
                <button id="btnAddSpacedSpace" class="btn orange waves-effect waves-light col s3" onclick="actionAddSpaced12Spaces()"
                        type="button">
                    1/2
                </button>
                <button id="btnAddSpacedSpace" class="btn orange waves-effect waves-light col s3" onclick="actionAddSpaced21Spaces()"
                        type="button">
                    2/1
                </button>
            </div>
            <button id="btnFillAll" class="btn orange waves-effect waves-light col s3" onclick="fillUpAll()"
                    type="button">
                <i class="mddi mddi-basket-fill"></i> Alles füllen
            </button>
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
</main>
<script type="text/javascript" src="https://cdn.rawgit.com/eligrey/FileSaver.js/e9d941381475b5df8b7d7691013401e171014e89/FileSaver.min.js"></script>
<script src="js/depart.js"></script>
{include file="end.tpl"}