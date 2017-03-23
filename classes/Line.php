<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 30.10.2016
     * Time: 19:30
     */

    namespace moovit;

    class Line {
        private $lineID, $lineShort, $lineLong, $type, $pdo;

        /**
         * Line constructor.
         *
         * @param $lineID int
         * @param $lineShort string
         * @param $lineLong string
         * @param $type int
         */
        public function __construct($lineID, $lineShort, $lineLong, $type) {
            $this->lineID = $lineID;
            $this->lineShort = $lineShort;
            $this->lineLong = $lineLong;
            $this->type = $type;
            $this->pdo = new PDO_MYSQL();
        }

        /**
         * @param $lID
         * @return Line
         */
        public static function fromLID($lID) {
            $pdo = new PDO_MYSQL();
            $res = $pdo->query("SELECT * FROM moovit_lines WHERE lID = :lid", [":lid" => $lID]);
            return new Line($lID, utf8_encode($res->nameShort), utf8_encode($res->nameLong), $res->type);
        }

        /**
         * @param $type int
         * @return string
         */
        private static function typeIDToString($type) {
            switch($type) {
                case 0:
                    return "Bus";
                    break;
                case 1:
                    return "Tram";
                    break;
                case 2:
                    return "Zug";
                    break;
                case 3:
                    return "Gondel";
                    break;
                case 4:
                    return "U-Bahn";
                    break;
                case 6:
                    return "Fähre";
                    break;
                case 7:
                    return "Cablecar";
                    break;
                case 8:
                    return "Flugzeug";
                    break;
                case 9:
                    return "Hyperloop";
                    break;
                default:
                    return "Mhhh...";
            }
        }

        public function asArray() {
            return [
                "id" => $this->lineID,
                "nameLong" => $this->lineLong,
                "nameShort" => $this->lineShort,
                "type" => self::typeIDToString($this->type),
                "typeID" => $this->type
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
                "nameAsc"  => "ORDER BY LENGTH(nameShort), nameShort ASC",
                "idAsc"    => "ORDER BY stID ASC",
                "nameDesc" => "ORDER BY LENGTH(nameShort), nameShort DESC",
                "idDesc"   => "ORDER BY stID DESC",
                "" => ""
            ];

            $pdo = new PDO_MYSQL();
            $startElem = ($page-1) * $pagesize;
            $endElem = $pagesize;
            $stmt = $pdo->queryPagedList("moovit_lines", $startElem, $endElem, ["nameShort","nameLong"], $search, "WHERE prID = ".$_SESSION['prID']." ".$SSORTING[$sort]);
            $hits = self::getListMeta($page, $pagesize, $search);
            while($row = $stmt->fetchObject()) {
                array_push($hits["lines"], [
                    "id" => $row->lID,
                    "nameLong" => utf8_encode($row->nameLong),
                    "nameShort" => utf8_encode($row->nameShort),
                    "type" => self::typeIDToString($row->type),
                    "check" => md5($row->lID+$row->nameLong+$row->nameShort+$row->type)
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
            if($search != "") $res = $pdo->query("select count(*) as size from moovit_lines where lower(concat(nameShort,' ',nameLong)) like lower(:search)", [":search" => "%".$search."%"]);
            else $res = $pdo->query("select count(*) as size from moovit_lines");
            $size = $res->size;
            $maxpage = ceil($size / $pagesize);
            return [
                "size" => $size,
                "maxPage" => $maxpage,
                "page" => $page,
                "lines" => []
            ];
        }

        /**
         * Saves the Changes made to this object to the db
         */
        public function saveChanges() {
            $this->pdo->queryUpdate("moovit_lines",
                ["nameShort" => utf8_decode($this->lineShort),
                 "nameLong" => utf8_decode($this->lineLong),
                 "type" => $this->type],
                "lID = :lid",
                ["lid" => $this->lineID]
            );
        }

        /**
         * Creates a new station from the give attribs
         *
         * @param $lineShort string
         * @param $lineLong string
         * @param $type string
         */
        public static function createLine($lineShort, $lineLong, $type) {
            $pdo = new PDO_MYSQL();
            $pdo->queryInsert("moovit_lines",
                ["nameLong" => utf8_decode($lineLong),
                 "nameShort" => utf8_decode($lineShort),
                 "prID" => $_SESSION["prID"],
                 "type" => $type]
            );
        }

        public function delete() {
            $this->pdo->query("DELETE FROM moovit_lines WHERE lID = :lid", [":lid" => $this->lineID]);
        }

        /**
         * @return mixed
         */
        public function getLineID() {
            return $this->lineID;
        }

        /**
         * @return mixed
         */
        public function getLineShort() {
            return $this->lineShort;
        }

        /**
         * @param mixed $lineShort
         */
        public function setLineShort($lineShort) {
            $this->lineShort = $lineShort;
        }

        /**
         * @return mixed
         */
        public function getLineLong() {
            return $this->lineLong;
        }

        /**
         * @param mixed $lineLong
         */
        public function setLineLong($lineLong) {
            $this->lineLong = $lineLong;
        }

        /**
         * @return mixed
         */
        public function getType() {
            return $this->type;
        }

        /**
         * @param mixed $type
         */
        public function setType($type) {
            $this->type = $type;
        }
    }