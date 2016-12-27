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
    require_once '../../classes/Util.php';
    require_once '../../classes/Project.php';
    require_once '../../classes/Line.php';

    $user = \moovit\Util::checkSession();

    $trip = \moovit\TripType::fromTrID(intval($_GET["id"]));
    $tripName = $_POST["name"];
    $tripDirection = $_POST["direction"];
    $path = json_decode($_POST["path"]);

    if($tripDirection != "" && $tripName != "" && $path != "") {
        $trip->setTripName($tripName);
        $trip->setTripDirection($tripDirection);
        $trip->setStationLnks($path);
        $trip->saveChanges();
        echo json_encode(["success" => "1"]);
    } else echo json_encode(["success" => "0", "error" => "missing fields"]);
