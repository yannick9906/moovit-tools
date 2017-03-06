<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 30.10.2016
     * Time: 19:31
     */

    namespace moovit;


    class Station {
        private $stationID, $stationName, $posLat, $posLon, $code, $pdo;

        /**
         * Station constructor.
         *
         * @param $stationID
         * @param $stationName
         * @param $posLat
         * @param $posLon
         * @param $code
         */
        public function __construct($stationID, $stationName, $posLat, $posLon, $code) {
            $this->stationID = $stationID;
            $this->stationName = utf8_encode($stationName);
            $this->posLat = $posLat;
            $this->posLon = $posLon;
            $this->code = $code;
            $this->pdo = new PDO_MYSQL();
        }

        public static function fromStID($stID) {
            $pdo = new PDO_MYSQL();
            $res = $pdo->query("SELECT * FROM moovit_stations WHERE stID = :stid", [":stid" => $stID]);
            return new Station($stID, $res->stationName, $res->posLat, $res->posLon, $res->stationCode);
        }

        public static function fromStationName($name) {
            $pdo = new PDO_MYSQL();
            $res = $pdo->query("SELECT * FROM moovit_stations WHERE concat(stationName,' ',stationCode)= :name", [":name" => utf8_decode($name)]);
            return new Station($res->stID, $res->stationName, $res->posLat, $res->posLon, $res->stationCode);
        }

        public static function checkStation($name, $code) {
            $pdo = new PDO_MYSQL();
            $res = $pdo->query("select * from moovit_stations where lower(concat(stationName,' ',stationCode)) = lower(:name)",[":name" => utf8_decode($name." ".$code)]);
            if($res->stID != null)
                return new Station($res->stID, $res->stationName, $res->posLat, $res->posLon, $res->stationCode);
            else
                return null;
        }

        private function distanceGeoPoints($lat1, $lng1, $lat2, $lng2) {

            $earthRadius = 3958.75;

            $dLat = deg2rad($lat2-$lat1);
            $dLng = deg2rad($lng2-$lng1);


            $a = sin($dLat/2) * sin($dLat/2) +
                cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
                sin($dLng/2) * sin($dLng/2);
            $c = 2 * atan2(sqrt($a), sqrt(1-$a));
            $dist = $earthRadius * $c;

            // from miles
            $meterConversion = 1609;
            $geopointDistance = $dist * $meterConversion;

            return $geopointDistance;
        }

        public function isInRange($lat, $lon) {
            return $this->distanceGeoPoints($this->posLat, $this->posLon, $lat, $lon) <= 50;
        }

        public function asArray() {
            return [
                "id" => $this->stationID,
                "name" => $this->stationName,
                "posLat" => $this->posLat,
                "posLon" => $this->posLon,
                "code" => $this->code
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
                "nameAsc"  => "ORDER BY stationName, stationCode ASC",
                "idAsc"    => "ORDER BY stID ASC",
                "nameDesc" => "ORDER BY stationName, stationCode DESC",
                "idDesc"   => "ORDER BY stID DESC",
                "" => ""
            ];

            $pdo = new PDO_MYSQL();
            $startElem = ($page-1) * $pagesize;
            $endElem = $pagesize;
            $stmt = $pdo->queryPagedList("moovit_stations", $startElem, $endElem, ["stationName","stationCode"], $search, "WHERE prID = ".$_SESSION['prID']." ".$SSORTING[$sort]);
            $hits = self::getListMeta($page, $pagesize, $search);
            while($row = $stmt->fetchObject()) {
                array_push($hits["stations"], [
                    "id" => $row->stID,
                    "name" => utf8_encode($row->stationName),
                    "code" => utf8_encode($row->stationCode),
                    "posLat" => $row->posLat,
                    "posLon" => $row->posLon,
                    "check" => md5($row->stID+$row->stationName+$row->stationCode+$row->posLat+$row->posLon)
                ]);
            }
            return $hits;
        }

        /**
         * Returns all entries
         *
         * @return array Normal dict array with data
         */
        public static function getSimpleList() {
            $pdo = new PDO_MYSQL();
            $stmt = $pdo->queryList("moovit_stations");
            $hits = [];
            while($row = $stmt->fetchObject()) {
                $hits["stations"][utf8_encode($row->stationName)." ".utf8_encode($row->stationCode)] = null;
            }
            return $hits;
        }

        /**
         * Returns all entries
         *
         * @param $boundALat float
         * @param $boundALng float
         * @param $boundBLat float
         * @param $boundBLng float
         * @return array Normal dict array with data
         */
        public static function getMapList($boundALat, $boundALng, $boundBLat, $boundBLng) {
            $pdo = new PDO_MYSQL();
            $stmt = $pdo->queryMulti("select * from moovit_stations where prID = :prID and (posLat between :boundBLat and :boundALat) and (posLon between :boundBLon and :boundALon)", [":boundALat" => $boundALat, ":boundALon" => $boundALng, ":boundBLat" => $boundBLat, ":boundBLon" => $boundBLng, ":prID" => $_SESSION["prID"]]);
            $hits = ["stations" => []];
            while($row = $stmt->fetchObject()) {
                array_push($hits["stations"], [
                    "id" => $row->stID,
                    "name" => utf8_encode($row->stationName),
                    "code" => utf8_encode($row->stationCode),
                    "posLat" => $row->posLat,
                    "posLon" => $row->posLon,
                    "check" => md5($row->stID+$row->stationName+$row->stationCode+$row->posLat+$row->posLon)
                ]);            }
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
            if($search != "") $res = $pdo->query("select count(*) as size from moovit_stations where lower(concat(stationName,' ',stationCode)) like lower(:search)", [":search" => "%".$search."%"]);
            else $res = $pdo->query("select count(*) as size from moovit_stations");
            $size = $res->size;
            $maxpage = ceil($size / $pagesize);
            return [
                "size" => $size,
                "maxPage" => $maxpage,
                "page" => $page,
                "stations" => []
            ];
        }

        /**
         * Saves the Changes made to this object to the db
         */
        public function saveChanges() {
            $this->pdo->queryUpdate("moovit_stations",
                ["stationName" => utf8_decode($this->stationName),
                 "stationCode" => utf8_decode($this->code),
                 "posLat" => $this->posLat,
                 "posLon" => $this->posLon],
                "stID = :sid",
                ["sid" => $this->stationID]
            );

            $stationLinksStartingHere = StationLnk::getStationLinksForStationStart($this->stationID);
            $stationLinksEndingHere = StationLnk::getStationLinksForStationEnd($this->stationID);

            foreach($stationLinksStartingHere as $stationLnk) $stationLnk->refreshStationPos();
            foreach($stationLinksEndingHere as $stationLnk) $stationLnk->refreshStationPos();
        }

        /**
         * Creates a new station from the give attribs
         *
         * @param $stationName
         * @param $stationCode
         * @param $lat
         * @param $lon
         */
        public static function createStation($stationName, $stationCode, $lat, $lon) {
            $pdo = new PDO_MYSQL();
            $pdo->queryInsert("moovit_stations",
                ["stationName" => utf8_decode($stationName),
                 "stationCode" => utf8_decode($stationCode),
                 "prID" => $_SESSION["prID"],
                 "posLat" => $lat,
                 "posLon" => $lon]
            );
        }

        public function remove() {
            if(sizeof(StationLnk::getStationLinksForStation($this)["links"])==0) {
                $this->pdo->query("delete from moovit_stations where stID = :stID", [":stID" => $this->stationID]);
                return true;
            } else return false;
        }

        /**
         * @return mixed
         */
        public function getStationID() {
            return $this->stationID;
        }

        /**
         * @param mixed $stationID
         */
        public function setStationID($stationID) {
            $this->stationID = $stationID;
        }

        /**
         * @return mixed
         */
        public function getStationName() {
            return $this->stationName;
        }

        /**
         * @param mixed $stationName
         */
        public function setStationName($stationName) {
            $this->stationName = $stationName;
        }

        /**
         * @return mixed
         */
        public function getPosLat() {
            return $this->posLat;
        }

        /**
         * @param mixed $posLat
         */
        public function setPosLat($posLat) {
            $this->posLat = $posLat;
        }

        /**
         * @return mixed
         */
        public function getPosLon() {
            return $this->posLon;
        }

        /**
         * @param mixed $posLon
         */
        public function setPosLon($posLon) {
            $this->posLon = $posLon;
        }

        /**
         * @return mixed
         */
        public function getCode() {
            return $this->code;
        }

        /**
         * @param mixed $code
         */
        public function setCode($code) {
            $this->code = $code;
        }
    }