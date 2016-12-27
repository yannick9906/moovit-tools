<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 04.10.2016
     * Time: 22:05
     */

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Station.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/StationLnk.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();

    $link = \moovit\StationLnk::fromLnkID(intval($_GET["id"]));
    if($link != null)
        echo json_encode($link->asArray());
    else
        echo json_encode(["error" => "ID unknown"]);