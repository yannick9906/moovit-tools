<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 29.09.2016
     * Time: 19:53
     */

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/Station.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();
    $pagesize = 12;
    if(isset($_GET["pagesize"])) $pagesize = intval($_GET["pagesize"]);

    $stations = \moovit\Station::getList($_GET["page"], $pagesize, $_GET["search"], $_GET["sort"]);
    echo json_encode($stations);