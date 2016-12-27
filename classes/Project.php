<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 30.10.2016
     * Time: 19:30
     */

    namespace moovit;


    class Project {
        private $pdo, $projectID, $projectName, $lineCount, $tripCount, $stopCount, $linkCount;

        /**
         * Project constructor.
         *
         * @param $projectID
         * @param $projectName
         */
        public function __construct($projectID, $projectName) {
            $this->projectID = $projectID;
            $this->projectName = $projectName;
            $this->pdo = new PDO_MYSQL();
            $this->lineCount = $this->pdo->query("select count(*) as count from moovit_lines where prID = :prID", [":prID" => $projectID])->count;
            $this->tripCount = $this->pdo->query("select count(*) as count from moovit_tripTypes where lID in(select lID from moovit_lines where prID = :prID)", [":prID" => $projectID])->count;
            $this->stopCount = $this->pdo->query("select count(*) as count from moovit_stations where prID = :prID", [":prID" => $projectID])->count;
            $this->linkCount = $this->pdo->query("select count(*) as count from moovit_stationLnks where startStationID in(select stID from moovit_stations where prID = :prID)", [":prID" => $projectID])->count;
        }

        public static function fromPrID($prID) {
            $pdo = new PDO_MYSQL();
            $res = $pdo->query("SELECT * FROM moovit_projects WHERE prID = :prid", [":prid" => $prID]);
            return new Project($prID, $res->projectName);
        }

        public function asArray() {
            return [
                "id" => $this->projectID,
                "name" => $this->projectName,
                "lineCount" => $this->lineCount,
                "tripCount" => $this->tripCount,
                "stopCount" => $this->stopCount,
                "linkCount" => $this->linkCount
            ];
        }

        /**
         * @return mixed
         */
        public function getProjectID() {
            return $this->projectID;
        }

        /**
         * @param mixed $projectID
         */
        public function setProjectID($projectID) {
            $this->projectID = $projectID;
        }

        /**
         * @return mixed
         */
        public function getProjectName() {
            return $this->projectName;
        }

        /**
         * @param mixed $projectName
         */
        public function setProjectName($projectName) {
            $this->projectName = $projectName;
        }
    }