<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 14.12.2016
     * Time: 23:43
     */

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/Station.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();

    $stations = \moovit\Station::getMapList($_GET["boundALat"], $_GET["boundALng"], $_GET["boundBLat"], $_GET["boundBLng"]);
    echo json_encode($stations);