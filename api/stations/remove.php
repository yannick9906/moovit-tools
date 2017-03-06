<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 2017-03-06
     * Time: 10:50 PM
     */

    ini_set("display_errors", "on");
    error_reporting(E_ALL & ~E_NOTICE);

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/Project.php';
    require_once '../../classes/Station.php';
    require_once '../../classes/StationLnk.php';

    $user = \moovit\Util::checkSession();

    $station = \moovit\Station::fromStID(intval($_GET["id"]));

    if($station != null) {
        if($station->remove())
            echo json_encode(["success" => "1"]);
        else echo json_encode(["success" => "0", "error" => "in_use"]);
    } else
        echo json_encode(["success" => "0", "error" => "ID unknown"]);