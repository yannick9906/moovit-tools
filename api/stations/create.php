<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 04.10.2016
     * Time: 22:36
     */

    ini_set("display_errors", "on");
    error_reporting(E_ALL & ~E_NOTICE);

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Station.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/Project.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();

    $stationName = $_POST["stationName"];
    $stationCode = $_POST["stationCode"];
    $posLat = $_POST["lat"];
    $posLon = $_POST["lon"];
    if($stationName != "" && $stationCode != "" && $posLat != "" && $posLon != "") {
        \moovit\Station::createStation($user, $stationName, $stationCode, $posLat, $posLon);
        echo json_encode(["success" => "1"]);
    } else  echo json_encode(["success" => "0", "error" => "missing fields"]);