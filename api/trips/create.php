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
    require_once '../../classes/TripType.php';
    require_once '../../classes/Line.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/Project.php';

    $user = \moovit\Util::checkSession();

    $tripName = $_POST["name"];
    $tripDirection = $_POST["direction"];
    $lID = intval($_POST["lID"]);

    if($tripName != "" && $tripDirection != "" && $lID != "") {
        \moovit\TripType::createTrip($tripName, $lID, $tripDirection);
        echo json_encode(["success" => "1"]);
    } else  echo json_encode(["success" => "0", "error" => "missing fields"]);