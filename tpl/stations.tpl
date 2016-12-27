{include file="base.tpl" args=$header}
<main>
    <div class="container row" id="stationList">
        <form class="col s12 m9" method="post" action="" id="live-search">
            <div class="row" id="search">
                <div class="input-field col s12 ">
                    <i class="mddi mddi-magnify prefix grey-text text-darken-2"></i>
                    <input id="filter" type="text" class="validate">
                    <label for="filter">In Haltestellen suchen ...</label>
                </div>
            </div>
        </form>
        <div class="input-field col s6 m2 offset-m1">
            <select id="sort">
                <option value="idAsc">ID aufstg.</option>
                <option value="idDesc">ID abstg.</option>
                <option value="nameAsc">Name aufstg.</option>
                <option value="nameDesc">Name abstg.</option>
            </select>
            <label>Sortieren nach</label>
        </div>
        <ul id="pages" class="pagination col s12 center center-align">
        </ul>
        <table class="highlight col s12">
            <thead>
            <tr>
                <th data-field="id">ID</th>
                <th data-field="name">Name</th>
                <th data-field="email">Position</th>
            </tr>
            </thead>
            <tbody id="stations">
            <tr>
                <td colspan="3" class="grey-text center"><i>Elemente werden geladen...</i></td>
            </tr>
            </tbody>
        </table>
        <div class="fixed-action-btn">
            <a class="btn-floating btn-large waves-effect waves-light green" onclick="newStation();">
                <i class="mddi mddi-map-marker"></i>
            </a>
        </div>
    </div>
    <div class="container" id="stationForm" style="display: none;">
        <div class="card-panel">
            <div class="row">
                <div class="col s12 bolden orange-text text-darken-4" id="newStationTitle">
                    Neue Haltestelle erstellen
                </div>
                <div class="col s12 bolden orange-text text-darken-4" id="editStationTitle">
                    Haltestelle bearbeiten
                </div>
                <form class="col s12" id="newStationFields">
                    <div class="row">
                        <div class="input-field col s6">
                            <input id="new-stationName" type="text">
                            <label for="new-stationName">Haltestellenname</label>
                        </div>
                        <div class="input-field col s6">
                            <input id="new-stationCode" type="text">
                            <label for="new-stationCode">Haltestellencode</label>
                        </div>
                    </div>
                </form>
                <form class="col s12" id="editStationFields">
                    <div class="row">
                        <div class="input-field col s6">
                            <input id="edit-stationName" type="text">
                            <label for="edit-stationName">Haltestellenname</label>
                        </div>
                        <div class="input-field col s6">
                            <input id="edit-stationCode" type="text">
                            <label for="edit-stationCode">Haltestellencode</label>
                        </div>
                    </div>
                </form>
                <div class="col s12">
                    <div style="height:500px;" id="map_canvas"></div>
                </div>
                <br/>
                <div class="col s12" id="newStationBtns">
                    <a class="waves-effect waves-light btn orange right" onclick="submitNewStation();">erstellen</a>
                    <a class="waves-effect waves-red btn-flat right" onclick="backToList();">abbrechen</a>
                </div>
                <div class="col s12" id="editStationBtns">
                    <a class="waves-effect waves-light btn orange right" onclick="submitEditStation();">speichern</a>
                    <a class="waves-effect waves-red btn-flat right" onclick="backToList();">abbrechen</a>
                </div>
            </div>
        </div>
    </div>
</main>
<script>
    $(document).ready(function() {
        $('select').material_select();
    });
</script>
<script src="js/stations.js"></script>
<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBV0Ll8dkPpMbS5xrTtgqHukmFd8x2FU5M&callback=initMap"

{include file="end.tpl"}