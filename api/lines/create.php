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
    require_once '../../classes/Project.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();

    $lineShort = $_POST["nameShort"];
    $lineLong = $_POST["nameLong"];
    $type = intval($_POST["type"]);

    if($lineShort != "" && $lineLong != "") {
        \moovit\Line::createLine($user, $lineShort, $lineLong, $type);
        echo json_encode(["success" => "1"]);
    } else  echo json_encode(["success" => "0", "error" => "missing fields"]);