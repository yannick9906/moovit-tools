<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 28.09.2016
     * Time: 21:48
     */

    require_once 'classes/PDO_Mysql.php'; //DB Anbindung
    require_once 'lib/dwoo/lib/Dwoo/Autoloader.php'; //Dwoo Laden
    require_once 'classes/User.php';
    require_once 'classes/Project.php';
    require_once 'classes/Util.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();
    Dwoo\Autoloader::register();
    $dwoo = new Dwoo\Core();

    $pgdata = \moovit\Util::getEditorPageDataStub("Projekt", $user, "project");
    $pgdata["page"]["project"] = $user->getProject()->asArray();
    $dwoo->output("tpl/project.tpl", $pgdata);