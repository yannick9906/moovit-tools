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
                <tr>
                    <td> Bahnstraße</td>
                    <td class="bolden"><a class="green-text bolden" onclick="addSpace(event,0,1)">+</a>4.45</td><td class="bolden"><a class="green-text bolden" onclick="addSpace(event,0,2)">+</a>5.15</td>
                    <td class="bolden"><a class="green-text bolden" onclick="addSpace(event,0,3)">+</a>5.45</td><td class="bolden"><a class="green-text bolden" onclick="addSpace(event,0,4)">+</a>6.15</td>
                    <td class="bolden"><a class="green-text bolden" onclick="addSpace(event,0,5)">+</a>6.30</td><td class="bolden"><a class="green-text bolden" onclick="addSpace(event,0,6)">+</a>6.45</td>
                    <td class="bolden"><a class="green-text bolden" onclick="addSpace(event,0,7)">+</a>7.00</td><td class="bolden"><a class="green-text bolden" onclick="addSpace(event,0,8)">+</a>7.15</td>
                    <td class="bolden"><a class="green-text bolden" onclick="addSpace(event,0,9)">+</a>7.30</td><td class="bolden"><a class="green-text bolden" onclick="addSpace(event,0,10)">+</a>7.45</td>
            <div style="position: fixed; top:0; left: 0; z-index: 99;" id="fl_menu">
                <button id="btnAddSpace" class="btn orange waves-effect waves-light col s3" onclick="actionAddSpaces()"
                        type="button">
                    <i class="mddi mddi-plus"></i>
                </button>
                <button id="btnRemSpace" class="btn orange waves-effect waves-light col s3" onclick="actionRemoveSpaces()"
                        type="button">
                    <i class="mddi mddi-minus"></i>
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
<script src="js/depart.js"></script>
{include file="end.tpl"}