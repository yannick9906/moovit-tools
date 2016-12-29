<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 29.12.2016
     * Time: 01:20
     */

    ini_set("display_errors", "on");
    error_reporting(E_ALL & ~E_NOTICE);

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/Project.php';
    require_once '../../classes/Line.php';
    require_once '../../classes/TripType.php';

    $user = \moovit\Util::checkSession();

    $trip = \moovit\TripType::fromTrID(intval($_GET["id"]));

    if($trip != null) {
        $trip->delete();
        echo json_encode(["success" => "1"]);
    } else
        echo json_encode(["error" => "ID unknown"]);