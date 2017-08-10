<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 2017-05-09
     * Time: 10:44 PM
     */
    ini_set("display_errors", "on");
    error_reporting(E_ALL & ~E_NOTICE);

    require_once '../../classes/PDO_Mysql.php'; //DB Anbindung
    require_once '../../classes/User.php';
    require_once '../../classes/Util.php';
    //require_once '../../classes/Line.php';

    $user = \moovit\Util::checkSession();
    $pdo = new \moovit\PDO_MYSQL();

    $r = new HttpRequest("http://tripplan.moovitapp.com/services-app/services/AlertsAdmin/v4/Alerts", HttpRequest::METH_POST);
    $r->setOptions([
        "Admin-Signature" => "A8jY/QAAAVvOu5etEIKWcs1TzaRDFa4wC5lY1jKSffIQJRDRVHXhRZ3NlGdp0OwmQO77bsBH3p4dJ+vUb049fdfSbgsERnXIrM1A6HK5xFuNYRiEgv9kEKZseeKM42swEHSJi3TklBKf2onk6PUbaZWY8lqf14lS+QSf+Qid83iKDesvhg0VQ0vx0jo=",
        "App-Type" => "5",
        "CLIENT_VERSION" => "3.0.0.1",
        "Cookie" => "__utma=198904627.1881318236.1488734842.1490113542.1490113542.1; __utmc=198904627; __utmz=198904627.1490113542.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none); langId=41; _ga=GA1.2.1881318236.1488734842; _gid=GA1.2.1654090322.1494328703; metroId=4409; forceMetroId=4409; userId=63494397; loginKey=A8jY/QAAAVvOu5etEIKWcs1TzaRDFa4wC5lY1jKSffIQJRDRVHXhRZ3NlGdp0OwmQO77bsBH3p4dJ+vUb049fdfSbgsERnXIrM1A6HK5xFuNYRiEgv9kEKZseeKM42swEHSJi3TklBKf2onk6PUbaZWY8lqf14lS+QSf+Qid83iKDesvhg0VQ0vx0jo%3D; searchCount=1; tpSelectedTransTypesschedulePage=3",
        "Host" => "tripplan.moovitapp.com",
        "Origin" => "http://tripplan.moovitapp.com"
    ]);
    $r->setPostFields(["{\"includePopup\":false,\"includePush\":false,\"includeAgencyAlert\":true,\"fromDate\":null,\"toDate\":null}" => null]);
    try {
        echo $r->send()->getBody();
    } catch (HttpException $ex) {
        echo $ex;
    }
