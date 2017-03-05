{include file="base.tpl" args=$header}
<main>
    <div class="container row">
        <div class="card-panel col s12 row" id="options">
            <br/>
            <span class="col s12 bolden orange-text text-darken-4">ACCOUNT EINSTELLUNGEN - ERROR -42: Not implemented</span>
            <i class="col s12"><br/>Tut mir sehr leid, aber der "Benutzerprofildienst" ist heute leider nicht verfügbar.<br/>
                Selbst der "Gruppenrichtlinienclient" kann hier leider nichts mehr ausrichten...<br/>
                Versuche es in 42 Minuten erneut.<br/><br/>
            </i>
        </div>
        <div class="card-panel col s12 row">
            <div class="input-field col s4">
                <select id="selActProj">
                    <option value="" disabled selected>Projekte</option>
                </select>
                <label>Aktives Projekt</label>
            </div>
        </div>
    </div>
</main>
<script src="js/account.js"></script>
{include file="end.tpl"}