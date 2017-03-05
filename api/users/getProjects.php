<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 2017-03-05
     * Time: 02:49 PM
     */

    ini_set("display_errors", "on");
    error_reporting(E_ALL & ~E_NOTICE);

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Util.php';
    require_once '../../classes/Project.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();

    $projects = \moovit\Project::fromPrIDList($user->getProjects());

    echo json_encode(["active" => $_SESSION["prID"], "projects" => $projects]);
