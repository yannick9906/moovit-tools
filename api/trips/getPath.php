<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 26.12.2016
     * Time: 22:55
     */

    ini_set("display_errors", "on");
    error_reporting(E_ALL & ~E_NOTICE);

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Line.php';
    require_once '../../classes/TripType.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/StationLnk.php';
    require_once '../../classes/Station.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();

    $trip = \moovit\TripType::fromTrID(intval($_GET["id"]));
    if($trip != null)
        echo json_encode(["path" => json_encode($trip->getPath())]);
    else
        echo json_encode(["error" => "ID unknown"]);