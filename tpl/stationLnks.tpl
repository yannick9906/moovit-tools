{include file="base.tpl" args=$header}
<main>
    <div class="container row" id="stationLnkList">
        <form class="col s12 m9" method="post" action="" id="live-search">
            <div class="row" id="search">
                <div class="input-field col s12 ">
                    <i class="mddi mddi-magnify prefix grey-text text-darken-2"></i>
                    <input id="filter" type="text" class="validate">
                    <label for="filter">In Stationlinks suchen ...</label>
                </div>
            </div>
        </form>
        <div class="input-field col s6 m2 offset-m1">
            <select id="sort">
                <option value="startAsc">Start aufstg.</option>
                <option value="startDesc">Start abstg.</option>
                <option value="endAsc">Ende aufstg.</option>
                <option value="endAsc">Ende abstg.</option>
            </select>
            <label>Sortieren nach</label>
        </div>
        <ul id="pages" class="pagination col s12 center center-align">
        </ul>
        <table class="highlight col s12">
            <thead>
            <tr>
                <th data-field="id">ID</th>
                <th data-field="from">Von/Nach</th>
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
                <i class="mddi mddi-vector-polyline"></i>
            </a>
        </div>
    </div>
    <div class="container" id="linkForm" style="display: none;">
        <div class="card-panel">
            <div class="row">
                <div class="col s12 bolden orange-text text-darken-4">
                    Neuen Stationlink erstellen
                </div>
                <form class="col s12">
                    <div class="row">
                        <div class="col s6">
                            <div class="row">
                                <div class="input-field col s12">
                                    <i class="mddi mddi-map-marker prefix"></i>
                                    <input type="text" id="autocomplete-startstation" class="autocomplete">
                                    <label for="autocomplete-startstation">Von Haltestelle</label>
                                </div>
                            </div>
                        </div>
                        <div class="col s6">
                            <div class="row">
                                <div class="input-field col s12">
                                    <i class="mddi mddi-map-marker prefix"></i>
                                    <input type="text" id="autocomplete-endstation" class="autocomplete">
                                    <label for="autocomplete-endstation">Nach Haltestelle</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
                <br/>
                <div class="col s12">
                    <a class="waves-effect waves-light btn orange right" onclick="submitNewLink();">erstellen</a>
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
<script src="js/stationLnks.js"></script>

{include file="end.tpl"}