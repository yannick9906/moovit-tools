<!DOCTYPE html>
<html>
<head>
    <title>Moovit Tool - {$args.title}</title>
    <meta charset="utf-8" />
    <!--Import Google Icon Font-->
    <!--<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">-->
    <link href='https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700' rel='stylesheet' type='text/css'>
    <link href='https://fonts.googleapis.com/css?family=Roboto+Mono' rel='stylesheet' type='text/css'>
    <!--Import materialize.css-->
    <link type="text/css" rel="stylesheet" href="lib/materialize/css/materialize.css"  media="screen,projection"/>
    <link type="text/css" rel="stylesheet" href="css/style.css" />
    <link type="text/css" rel="stylesheet" href="css/materialdesignicons.min.css" media="all"/>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.2/dist/leaflet.css" />
    <link rel="stylesheet" href="lib/font-awesome-4.7.0/css/font-awesome.min.css" />
    <link rel="stylesheet" href="lib/awesome-markers/leaflet.awesome-markers.css" />

    <!--Let browser know website is optimized for mobile-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <link rel="manifest" href="../manifest.json" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="theme-color" content="#FF9800" />
</head>
<body>
<!--Import jQuery before materialize.js-->
<script type="text/javascript" src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
<script type="text/javascript" src="lib/materialize/js/materialize.min.js"></script>
<script type="text/javascript" src="lib/md5.js"></script>
<script type="text/javascript" src="lib/handlebars.js"></script>


<!-- Dropdown Structure -->
<ul id="dropdown1" class="dropdown-content">
    <li><a href="users.php?action=edit&uID={$args.uID}">Mein Account</a></li>
    <li class="divider"></li>
    <li><a href="login.php?err=3">Abmelden</a></li>
</ul>
<div class="navbar-fixed">
    <nav class="black">
        <div class="nav-wrapper">
            <a href="#!" class="brand-logo hide-on-med-and-down orange-text text-darken-2" style="padding-left: 310px;">Moovit Tool</a>
            <a href="#!" class="brand-logo hide-on-large-only orange-text">Moovit Tool</a>
            <ul id="slide-out" class="side-nav fixed">
                <li><div class="userView">
                        <img class="background" src="css/mvg.jpg" width="300px" style="margin-top: -56px">
                        <a href="#!"><div class="circle red center white-text" style="font-size: 40px; line-height: 65px;">{$args.usrchar}</div></a>
                        <a href="#!"><span class="white-text name" style="text-shadow: 1px 1px 5px black;">{$args.realname} - {$args.points} Punkte</span></a>
                        <a href="#!"><span class="white-text email" style="text-shadow: 1px 1px 5px black;" id="projectname">{$args.projectname}</span></a>
                    </div></li>
                <li id="nav-account"><a href="account.php"><i class="mddi mddi-account-settings-variant"></i>Account</a></li>
                <li id="nav-logout"><a href="login.php?err=3"><i class="mddi mddi-logout-variant"></i>Logout</a></li>
                <li><div class="divider"></div></li>
                <li class="subheader"><a class="subheader orange-text text-darken-4 bolden">Projekt</a></li>
                <li id="nav-project"><a href="project.php"><i class="mddi mddi-information-outline"></i>Info</a></li>
                <li id="nav-map"><a href="map.php"><i class="mddi mddi-map"></i>Karte</a></li>
                <!--<li id="nav-stations"><a href="stations.php"><i class="mddi mddi-map-marker-radius"></i>Haltestellen</a></li>-->
                <!--<li id="nav-lnks"><a href="stationLnks.php"><i class="mddi mddi-vector-polyline"></i>Station Links</a></li>-->
                <li id="nav-lines"><a href="linesmap.php"><i class="mddi mddi-vector-line"></i>Linien</a></li>
                <li><div class="divider"></div></li>
                <li><a class="subheader orange-text text-darken-4 bolden">Tools</a></li>
                <li id="nav-timetable"><a href="depart.php"><i class="mddi mddi-timetable"></i>Fahrplan</a></li>
                <li><div class="divider"></div></li>
                {if $args.uID == 1}
                    <li><a class="subheader orange-text text-darken-4 bolden">Administration</a></li>
                    <li id="nav-database"><a href="../adminer/"><i class="mddi mddi-database"></i>Datenbank</a></li>
                    <li><div class="divider"></div></li>
                {/if}
            </ul>
            <a href="#" data-activates="slide-out" class="button-collapse"><i class="material-icons">menu</i></a>
        </div>
        <script>
            $(document).ready(function() {
                $("#nav-{$args.highlight}").addClass("active");
            });
        </script>
    </nav>
</div>