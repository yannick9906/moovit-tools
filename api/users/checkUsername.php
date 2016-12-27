<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 28.09.2016
     * Time: 20:00
     */

    require_once("../../classes/Util.php");
    require_once("../../classes/User.php");
    require_once("../../classes/PDO_Mysql.php");

    $usernameToCheck = $_GET["username"];

    $exists = \moovit\User::doesUserNameExist($usernameToCheck);

    echo json_encode(["exists" => $exists]);