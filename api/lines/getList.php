<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 26.12.2016
     * Time: 03:01
     */

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/Line.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();
    $pagesize = 12;
    if(isset($_GET["pagesize"])) $pagesize = intval($_GET["pagesize"]);

    $stations = \moovit\Line::getList($_GET["page"], $pagesize, $_GET["search"], $_GET["sort"]);
    echo json_encode($stations);
