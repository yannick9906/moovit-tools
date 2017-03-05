<?php
    /**
     * Created by PhpStorm.
     * User: yanni
     * Date: 30.06.2016
     * Time: 21:19
     */

    namespace moovit;


    use moovit;

    class User {
        private $pdo, $uID, $uName, $uRealname, $uPassHash, $points;

        /**
         * User constructor.
         *
         * @param int    $uID
         * @param string $uName
         * @param string $uRealname
         * @param string $uPassHash
         * @param int    $points
         */
        public function __construct($uID, $uName, $uRealname, $uPassHash, $points) {
            $this->uID = $uID;
            $this->uName = utf8_encode($uName);
            $this->uRealname = utf8_encode($uRealname);
            $this->uPassHash = $uPassHash;
            $this->points = $points;
            $this->pdo = new PDO_MYSQL();
        }

        /**
         * Creates a new User Object from a given user ID
         *
         * @param $uID int User ID
         * @return User
         */
        public static function fromUID($uID) {
            $pdo = new PDO_MYSQL();
            $res = $pdo->query("SELECT * FROM moovit_user WHERE uID = :uid", [":uid" => $uID]);
            return new User($res->uID, $res->username, $res->realname, $res->passhash, $res->points);
        }
        
        /**
         * Creates a new User Object from a given username
         *
         * @param $uName string Username
         * @return User
         */
        public static function fromUName($uName) {
            $pdo = new PDO_MYSQL();
            $res = $pdo->query("SELECT * FROM moovit_user WHERE username = :uname", [":uname" => $uName]);
            return new User($res->uID, $res->username, $res->realname, $res->passhash, $res->points);
        }

        /**
         * Compares a md5() hash with the given Hash from db
         *
         * @param $hash string md5-hash
         * @return bool
         */
        public function comparePWHash($hash) {
            if($hash == $this->uPassHash) {
                echo $hash . "<br/>" . $this->uPassHash;
                return true;
            } else {
                echo $hash . "<br/>" . $this->uPassHash;
                return false;
            }
        }

        public function getProject() {
            $res = $this->pdo->query("SELECT * FROM `moovit_user-project` WHERE uID = :uid LIMIT 1", [":uid" => $this->uID]);
            return Project::fromPrID($res->prID);
        }

        public function getProjects() {
            $stmt = $this->pdo->queryMulti("SELECT * FROM `moovit_user-project` WHERE uID = :uid", [":uid" => $this->uID]);

            $hits = [];
            while($row = $stmt->fetchObject()) {
                array_push($hits, $row->prID);
            }

            return $hits;
        }


        /**
         * Makes this class as an array to use for tables etc.
         *
         * @return array
         */
        public function asArray() {
            return [
                "uID" => $this->uID,
                "username" => $this->uName,
                "realname" => $this->uRealname,
                "points" => $this->points
            ];
        }


        /**
         * Makes this class as an string to use for debug only
         *
         * @return string
         */
        public function toString() {
            return
                "id:        ".$this->uID."\n".
                "usrname:   ".$this->uName."\n".
                "realname:  ".$this->uRealname."\n";
        }

        /**
         * checks if a username is in the user db
         *
         * @param $uName string Username
         * @return bool
         */
        public static function doesUserNameExist($uName) {
            $pdo = new PDO_MYSQL();
            $res = $pdo->query("SELECT * FROM moovit_user WHERE username = :uname", [":uname" => $uName]);
            return isset($res->uID);
        }

        /**
         * Returns all entries matching the search and the page
         *
         * @param int $page
         * @param int $pagesize
         * @param string $search
         *
         * @return array Normal dict array with data
         */
        public static function getList($page = 1, $pagesize = 75, $search = "") {
            $pdo = new PDO_MYSQL();
            $startElem = ($page-1) * $pagesize;
            $endElem = $pagesize;
            $stmt = $pdo->queryPagedList("moovit_user", $startElem, $endElem, ["username","realname"], $search);

            $hits = self::getListMeta($page, $pagesize, $search);
            while($row = $stmt->fetchObject()) {
                array_push($hits["items"], [
                    "uID" => $row->iID,
                    "username" => utf8_encode($row->itemName),
                    "realname" => utf8_encode($row->inStock),
                    "check" => md5($row->uID+$row->username+$row->realname)
                ]);
            }
            return $hits;
        }

        /**
         * @see getList()
         * but you'll get Objects instead of an array
         *
         * @param int $page
         * @param int $pagesize
         * @param string $search
         *
         * @return User[]
         */
        public static function getListObjects($page, $pagesize, $search) {
            $pdo = new PDO_MYSQL();
            $startElem = ($page-1) * $pagesize;
            $endElem = $pagesize;
            $stmt = $pdo->queryPagedList("moovit_user", $startElem, $endElem, ["username","realname"], $search);

            $hits = [];
            while($row = $stmt->fetchObject()) {
                array_push($hits, new User(
                        $row->uID,
                        $row->username,
                        $row->realname,
                        $row->passHash)
                );
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
            if($search != "") $res = $pdo->query("select count(*) as size from moovit_user where lower(concat(username,' ',realname)) like lower(:search)", [":search" => "%".$search."%"]);
            else $res = $pdo->query("select count(*) as size from moovit_user");
            $size = $res->size;
            $maxpage = ceil($size / $pagesize);
            return [
                "size" => $size,
                "maxPage" => $maxpage,
                "page" => $page,
                "items" => []
            ];
        }

        /**
         * Deletes a user
         *
         * @return bool
         */
        public function delete() {
            return $this->pdo->query("DELETE FROM moovit_user WHERE uID = :uid", [":uid" => $this->uID]);
        }

        /**
         * Saves the Changes made to this object to the db
         */
        public function saveChanges() {
            $this->pdo->queryUpdate("moovit_user",
                ["username" => utf8_decode($this->uName),
                "realname" => utf8_decode($this->uRealname),
                "passhash" => $this->uPassHash,
                "points" => $this->points],
                "uID = :uid",
                ["uid" => $this->uID]
            );
        }

        /**
         * Creates a new user from the give attribs
         *
         * @param $username string Username
         * @param $realname string Realname of the user
         * @param $passwdhash string md5 Hash of Password
         */
        public static function createUser($username, $realname, $passwdhash) {
            $pdo = new PDO_MYSQL();
            $pdo->queryInsert("moovit_user",
                ["username" => $username,
                 "realname" => $realname,
                 "passhash" => $passwdhash]
            );
        }

        /**
         * @return int
         */
        public function getUID() {
            return $this->uID;
        }

        /**
         * @param int $uID
         */
        public function setUID($uID) {
            $this->uID = $uID;
        }

        /**
         * @return string
         */
        public function getUName() {
            return $this->uName;
        }

        /**
         * @param string $uName
         */
        public function setUName($uName) {
            $this->uName = $uName;
        }

        /**
         * @return string
         */
        public function getURealname() {
            return $this->uRealname;
        }

        /**
         * @param string $uRealname
         */
        public function setURealname($uRealname) {
            $this->uRealname = $uRealname;
        }

        /**
         * @return string
         */
        public function getUPassHash() {
            return $this->uPassHash;
        }

        /**
         * @param string $uPassHash
         */
        public function setUPassHash($uPassHash) {
            $this->uPassHash = $uPassHash;
        }

        /**
         * @param string $passHash
         * @return bool
         */
        public function comparePassHash($passHash) {
            return $this->uPassHash == $passHash;
        }

        /**
         * @return int
         */
        public function getPoints() {
            return $this->points;
        }

        /**
         * Adds value onto points and saves this object.
         *
         * @param int $value
         */
        public function addAction($value) {
            $this->points += $value;
            $this->saveChanges();
        }
    }