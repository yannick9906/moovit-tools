<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 2017-02-25
     * Time: 01:30 AM
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

    $pgdata = \moovit\Util::getEditorPageDataStub("Account", $user, "account");
    $dwoo->output("tpl/account.tpl", $pgdata);