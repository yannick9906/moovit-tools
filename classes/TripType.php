<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 30.10.2016
     * Time: 19:30
     */

    namespace moovit;


    class TripType {
        private $tripTypeID, $tripDirection, $tripLine, $tripName, $stationLnks, $pdo;

        /**
         * TripType constructor.
         *
         * @param $tripTypeID int
         * @param $tripLine Line
         * @param $tripDirection int
         * @param $tripName string
         * @param $stationLnks array
         */
        public function __construct($tripTypeID, $tripLine, $tripDirection, $tripName, $stationLnks) {
            $this->tripTypeID = $tripTypeID;
            $this->tripLine = $tripLine;
            $this->tripDirection = $tripDirection;
            $this->tripName = $tripName;
            $this->stationLnks = $stationLnks;
            $this->pdo = new PDO_MYSQL();
        }

        /**
         * @param $trID
         * @return TripType
         */
        public static function fromTrID($trID) {
            $pdo = new PDO_MYSQL();
            $res = $pdo->query("SELECT * FROM moovit_tripTypes WHERE trID = :trid", [":trid" => $trID]);
            return new TripType($trID, Line::fromLID($res->lID), $res->tripDirection, utf8_encode($res->tripName), json_decode($res->path));
        }

        /**
         * @return int
         */
        public static function getLastID() {
            $pdo = new PDO_MYSQL();
            $res = $pdo->query("SELECT trID FROM moovit_tripTypes ORDER BY trID DESC LIMIT 1");
            return $res->trID;
        }

        /**
         * @return array
         */
        public function asArray() {
            return [
                "id" => $this->tripTypeID,
                "line" => $this->tripLine->asArray(),
                "direction" => $this->tripDirection,
                "name" => $this->tripName,
                "links" => json_encode($this->stationLnks)
            ];
        }

        /**
         * @param $line Line
         * @return array
         */
        public static function getTripsForLine($line) {
            $pdo = new PDO_MYSQL();
            $stmt = $pdo->queryMulti("select * from moovit_tripTypes where lID = :lineID", [":lineID" => $line->getLineID()]);
            $hits = ["trips" => []];
            while($row = $stmt->fetchObject()) {
                $destination = "";
                $path = json_decode($row->path);
                if(sizeof($path) != 0) {
                    $lastLink = StationLnk::fromLnkID(array_pop($path));
                    $endStation = $lastLink->getToStation();
                    $destination = $endStation->getStationName()." ".$endStation->getCode();
                }
                array_push($hits["trips"], [
                    "id" => $row->trID,
                    "line" => Line::fromLID($row->lID)->asArray(),
                    "direction" => $row->tripDirection,
                    "name" => utf8_encode($row->tripName),
                    "links" => $row->path,
                    "destination" => $destination,
                    "check" => md5($row->trID+$row->lID+$row->path+$row->tripName+$row->tripDirection)
                ]);
            }
            return $hits;
        }

        /**
         * Saves the Changes made to this object to the db
         */
        public function saveChanges() {
            $this->pdo->queryUpdate("moovit_tripTypes",
                ["tripName" => utf8_decode($this->tripName),
                 "tripDirection" => $this->tripDirection,
                 "path" => json_encode($this->stationLnks),
                 "lID" => $this->tripLine->getLineID()],
                "trID = :trid",
                ["trid" => $this->tripTypeID]
            );
        }

        /**
         * Deletes a triptype
         */
        public function delete() {
            $this->pdo->query("DELETE FROM moovit_tripTypes WHERE trID = :trid", [":trid" => $this->tripTypeID]);
        }

        /**
         * Creates a new trip from the give attribs
         *
         * @param $tripName string
         * @param $lID int
         * @param $tripDirection int
         */
        public static function createTrip($tripName, $lID, $tripDirection) {
            $pdo = new PDO_MYSQL();
            $pdo->queryInsert("moovit_tripTypes",
                ["tripName" => utf8_decode($tripName),
                 "tripDirection" => $tripDirection,
                 "path" => json_encode([]),
                 "lID" => $lID]
            );
        }

        /**
         * @return mixed
         */
        public function getTripTypeID() {
            return $this->tripTypeID;
        }

        /**
         * @param mixed $tripTypeID
         */
        public function setTripTypeID($tripTypeID) {
            $this->tripTypeID = $tripTypeID;
        }

        /**
         * @return mixed
         */
        public function getTripDirection() {
            return $this->tripDirection;
        }

        /**
         * @param mixed $tripDirection
         */
        public function setTripDirection($tripDirection) {
            $this->tripDirection = $tripDirection;
        }

        /**
         * @return mixed
         */
        public function getTripName() {
            return $this->tripName;
        }

        /**
         * @param mixed $tripName
         */
        public function setTripName($tripName) {
            $this->tripName = $tripName;
        }

        /**
         * @return mixed
         */
        public function getStationLnks() {
            return $this->stationLnks;
        }

        /**
         * @param mixed $stationLnks
         */
        public function setStationLnks($stationLnks) {
            $this->stationLnks = $stationLnks;
        }

        /**
         * @return Line
         */
        public function getTripLine() {
            return $this->tripLine;
        }

        /**
         * @param Line $tripLine
         */
        public function setTripLine($tripLine) {
            $this->tripLine = $tripLine;
        }


        public function getPath() {
            $path = [];
            foreach($this->stationLnks as $link) {
                $link = StationLnk::fromLnkID($link);
                $path = array_merge($path, $link->getPath());
            }
            return $path;
        }
    }