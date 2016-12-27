<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 04.10.2016
     * Time: 22:36
     */

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Station.php';
    require_once '../../classes/StationLnk.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/Project.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();

    $fromStation = $_POST["startStation"];
    $toStation = $_POST["endStation"];

    if($fromStation != "" && $toStation != "") {
        \moovit\StationLnk::createStationLink($fromStation, $toStation);
        echo json_encode(["success" => "1"]);
    } else  echo json_encode(["success" => "0", "error" => "missing fields"]);