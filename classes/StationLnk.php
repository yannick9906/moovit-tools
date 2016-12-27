<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 30.10.2016
     * Time: 19:31
     */

    namespace moovit;


    class StationLnk {
        private $stationLnkID, $fromStation, $toStation, $path;

        /**
         * StationLnk constructor.
         *
         * @param $stationLnkID int
         * @param $fromStation Station
         * @param $toStation Station
         * @param $path array
         */
        public function __construct($stationLnkID, $fromStation, $toStation, $path) {
            $this->stationLnkID = $stationLnkID;
            $this->fromStation = $fromStation;
            $this->toStation = $toStation;
            $this->path = $path;
            $this->pdo = new PDO_MYSQL();
        }

        /**
         * @param $lnkID
         * @return StationLnk
         */
        public static function fromLnkID($lnkID) {
            $pdo = new PDO_MYSQL();
            $res = $pdo->query("SELECT * FROM moovit_stationLnks WHERE LnkID = :lnkid", [":lnkid" => $lnkID]);
            return new StationLnk($lnkID, Station::fromStID($res->startStationID), Station::fromStID($res->endStationID), json_decode($res->path));
        }

        public function asArray() {
            return [
                "id" => $this->stationLnkID,
                "fromStation" => $this->fromStation->asArray(),
                "toStation" => $this->toStation->asArray(),
                "path" => json_encode($this->path)
            ];
        }

        /**
         * Returns all entries matching the search and the page
         *
         * @param int    $page
         * @param int    $pagesize
         * @param string $search
         * @param string $sort
         *
         * @return array Normal dict array with data
         */
        public static function getList($page = 1, $pagesize = 75, $search = "", $sort = "") {
            $SSORTING = [
                "startAsc"  => "ORDER BY startStationID ASC",
                "endAsc"    => "ORDER BY endStationID ASC",
                "startDesc" => "ORDER BY startStationID DESC",
                "endDesc"   => "ORDER BY endStationID DESC",
                "" => ""
            ];

            $pdo = new PDO_MYSQL();
            $startElem = ($page-1) * $pagesize;
            $endElem = $pagesize;
            $stmt = $pdo->queryPagedLinkList("moovit_stationLnks", $startElem, $endElem, $search);
            $hits = self::getListMeta($page, $pagesize, $search);
            while($row = $stmt->fetchObject()) {
                array_push($hits["links"], [
                    "id" => $row->LnkID,
                    "fromStation" => Station::fromStID($row->startStationID)->asArray(),
                    "toStation" => Station::fromStID($row->endStationID)->asArray(),
                    "path" => $row->path,
                    "check" => md5($row->startStationID+$row->endStationID+$row->path)
                ]);
            }
            return $hits;
        }

        /**
         * Returns the array stub for the getLists() method
         *
         * @param int $page
         * @param int $pagesize
         * @param string $search
         * @return array
         */
        public static function getListMeta($page, $pagesize, $search) {
            $pdo = new PDO_MYSQL();
            if($search != "") $res = $pdo->query("select count(*) as size from moovit_stationLnks where lower(concat(startStationID,' ',endStationID)) like lower(:search)", [":search" => "%".$search."%"]);
            else $res = $pdo->query("select count(*) as size from moovit_stationLnks");
            $size = $res->size;
            $maxpage = ceil($size / $pagesize);
            return [
                "size" => $size,
                "maxPage" => $maxpage,
                "page" => $page,
                "links" => []
            ];
        }

        /**
         * Saves the Changes made to this object to the db
         */
        public function saveChanges() {
            $this->pdo->queryUpdate("moovit_stationLnks",
                ["startStationID" => $this->fromStation->getStationID(),
                 "endStationID" => $this->toStation->getStationID(),
                 "path" => json_encode($this->path)],
                "LnkID = :lnkid",
                ["lnkid" => $this->stationLnkID]
            );

        }

        /**
         * Creates a new station from the give attribs
         *
         * @param int   $fromstation
         * @param int   $tostation
         */
        public static function createStationLink($fromstation, $tostation) {
            $fromStation = Station::fromStID($fromstation);
            $toStation = Station::fromStID($tostation);
            $path = json_encode([["lat"=>floatval($fromStation->getPosLat()),"lng"=>floatval($fromStation->getPosLon())],["lat"=>floatval($toStation->getPosLat()),"lng"=>floatval($toStation->getPosLon())]]);
            $pdo = new PDO_MYSQL();
            $pdo->queryInsert("moovit_stationLnks",
                ["startStationID" => $fromStation->getStationID(),
                 "endStationID" => $toStation->getStationID(),
                 "path" => $path]
            );
        }

        /**
         * @param $station Station
         * @return array
         */
        public static function getStationLinksForStation($station) {
            $pdo = new PDO_MYSQL();
            $stmt = $pdo->queryMulti("select * from moovit_stationLnks where startStationID = :stationID", [":stationID" => $station->getStationID()]);
            $hits = ["links" => []];
            while($row = $stmt->fetchObject()) {
                array_push($hits["links"], [
                    "id" => $row->LnkID,
                    "fromStation" => Station::fromStID($row->startStationID)->asArray(),
                    "toStation" => Station::fromStID($row->endStationID)->asArray(),
                    "path" => $row->path,
                    "check" => md5($row->startStationID+$row->endStationID+$row->path)
                ]);
            }
            return $hits;
        }

        /**
         * @param $stationID int
         * @return StationLnk[]
         */
        public static function getStationLinksForStationStart($stationID) {
            $pdo = new PDO_MYSQL();
            $stmt = $pdo->queryMulti("select * from moovit_stationLnks where startStationID = :stationID", [":stationID" => $stationID]);
            $hits = [];
            while($row = $stmt->fetchObject()) {
                array_push($hits, StationLnk::fromLnkID($row->LnkID));
            }
            return $hits;
        }

        /**
         * @param $stationID int
         * @return StationLnk[]
         */
        public static function getStationLinksForStationEnd($stationID) {
            $pdo = new PDO_MYSQL();
            $stmt = $pdo->queryMulti("select * from moovit_stationLnks where endStationID = :stationID", [":stationID" => $stationID]);
            $hits = [];
            while($row = $stmt->fetchObject()) {
                array_push($hits, StationLnk::fromLnkID($row->LnkID));
            }
            return $hits;
        }

        /**
         * @return mixed
         */
        public function getStationLnkID() {
            return $this->stationLnkID;
        }

        /**
         * @param mixed $stationLnkID
         */
        public function setStationLnkID($stationLnkID) {
            $this->stationLnkID = $stationLnkID;
        }

        /**
         * @return mixed
         */
        public function getFromStation() {
            return $this->fromStation;
        }

        /**
         * @param mixed $fromStation
         */
        public function setFromStation($fromStation) {
            $this->fromStation = $fromStation;
        }

        /**
         * @return mixed
         */
        public function getToStation() {
            return $this->toStation;
        }

        /**
         * @param mixed $toStation
         */
        public function setToStation($toStation) {
            $this->toStation = $toStation;
        }

        /**
         * @return mixed
         */
        public function getPath() {
            return $this->path;
        }

        /**
         * @param mixed $path
         */
        public function setPath($path) {
            $path[0] = $this->path[0];
            $path[sizeof($path)-1] = $this->path[sizeof($this->path)-1];
            $this->path = $path;
        }

        public function refreshStationPos() {
            $this->path[0] = ["lat" => $this->fromStation->getPosLat(), "lng" => $this->fromStation->getPosLon()];
            $this->path[sizeof($this->path)-1] = ["lat" => $this->toStation->getPosLat(), "lng" => $this->toStation->getPosLon()];
            $this->saveChanges();
        }
    }