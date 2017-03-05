<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 04.10.2016
     * Time: 22:36
     */

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/Project.php';
    require_once '../../classes/Station.php';
    require_once '../../classes/StationLnk.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();

    $link = \moovit\StationLnk::fromLnkID(intval($_GET["id"]));
    $path = json_decode($_POST["path"]);


    if($path != "") {
        $link->setPath($path);
        $link->saveChanges();
        echo json_encode(["success" => "1"]);
        $user->addAction(2);
    } else echo json_encode(["success" => "0", "error" => "missing fields"]);