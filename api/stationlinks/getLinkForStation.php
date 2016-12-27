<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 14.12.2016
     * Time: 21:14
     */

    ini_set("display_errors", "on");
    error_reporting(E_ALL & ~E_NOTICE);

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/Station.php';
    require_once '../../classes/StationLnk.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();

    $station = \moovit\Station::fromStID(intval($_GET['id']));

    $links = \moovit\StationLnk::getStationLinksForStation($station);
    echo json_encode($links);