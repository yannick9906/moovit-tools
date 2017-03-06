<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 30.10.2016
     * Time: 15:34
     */

    ini_set("display_errors", "on");
    error_reporting(E_ALL & ~E_NOTICE);

    require_once 'classes/PDO_Mysql.php'; //DB Anbindung
    require_once 'lib/dwoo/lib/Dwoo/Autoloader.php'; //Dwoo Laden
    require_once 'classes/User.php';
    require_once 'classes/Util.php';
    require_once 'classes/Project.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();
    Dwoo\Autoloader::register();
    $dwoo = new Dwoo\Core();

    $pgdata = \moovit\Util::getEditorPageDataStub("Stationlinks", $user, "lnks");
    $dwoo->output("tpl/stationLnks.tpl", $pgdata);