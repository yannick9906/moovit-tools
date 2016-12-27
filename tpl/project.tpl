{include file="base.tpl" args=$header}
<main>
    <div class="container row">
        <div class="card-panel col s12 row">
            <br/>
            <span class="col s12 bolden orange-text text-darken-4">PROJEKT INFO</span>
            <div class="col s12 m6">
                <p class="bolden">Name: <br/>
                    Linien: <br/>
                    Trips: <br/>
                    Haltestellen: <br/>
                    StationLinks: <br/></p>
            </div>
            <div class="col s12 m6">
                <p>{$page.project.name}<br/>
                    {$page.project.lineCount}<br/>
                    {$page.project.tripCount}<br/>
                    {$page.project.stopCount}<br/>
                    {$page.project.linkCount}<br/></p>

            </div>
        </div>
    </div>
</main>
{include file="end.tpl"}