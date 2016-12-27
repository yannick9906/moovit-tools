<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 04.10.2016
     * Time: 22:36
     */

    ini_set("display_errors", "on");
    error_reporting(E_ALL & ~E_NOTICE);

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Permissions.php';
    require_once '../../classes/Util.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();

    $username = $_POST["username"];
    $realname = $_POST["realname"];
    $passhash = $_POST["passhash"];
    $email = $_POST["email"];

    if(!\moovit\User::doesUserNameExist($username)) {
        if($username != "" && $realname != "" && $passhash != "" && $email) {
            \moovit\User::createUser($username, $realname, $passhash, $email);
            echo json_encode(["success" => "1"]);
        } else  echo json_encode(["success" => "0", "error" => "missing fields"]);
    } else  echo json_encode(["success" => "0", "error" => "username exists"]);