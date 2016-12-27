<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 26.12.2016
     * Time: 03:01
     */

    ini_set("display_errors", "on");
    error_reporting(E_ALL & ~E_NOTICE);

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Line.php';
    require_once '../../classes/Util.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();

    $line = \moovit\Line::fromLID(intval($_GET["id"]));
    if($line != null)
        echo json_encode($line->asArray());
    else
        echo json_encode(["error" => "ID unknown"]);