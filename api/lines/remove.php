<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 2017-03-24
     * Time: 12:21 AM
     */

    ini_set("display_errors", "on");
    error_reporting(E_ALL & ~E_NOTICE);

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/Project.php';
    require_once '../../classes/Line.php';

    $user = \moovit\Util::checkSession();

    $line = \moovit\Line::fromLID(intval($_GET["id"]));

    if($line != null) {
        $line->delete();
        echo json_encode(["success" => "1"]);
    } else
        echo json_encode(["error" => "ID unknown"]);