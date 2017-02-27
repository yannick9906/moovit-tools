/**
 * Created by yanni on 2017-02-25.
 */
let timetable = [];
let trips = [];
let first = true;
let lastClicki = -1;
let lastClicki1 = -1;
let lastEndi = -1;
let lastEndi1 = -1;
let line = 0;
let direction = "in";
let day = "MoFr";
let type = "mvg";

$(document).ready(function() {
    $.support.selectstart = "onselectstart" in document.createElement("div");
    $.fn.disableSelection = function() {
        return this.bind( ( $.support.selectstart ? "selectstart" : "mousedown" ) +
            ".ui-disableSelection", function( event ) {
            event.preventDefault();
        });
    };
    $("#tripTypes").hide();
    $("#intervalTypes").hide();
    $("select").material_select();
});

function updateInfo() {
    line = $("#line_no").val();
    direction = $("#direction").val();
    day = $("#day").val();
}

function addPage() {
    let newPage = $("#addPageInput").val();
    newPage = newPage.replace(/u¨/g, "ü");
    newPage = newPage.replace(/a¨/g, "ä");
    newPage = newPage.replace(/o¨/g, "ö");
    newPage = newPage.replace(/\n$/, "");
    let newPageLines = newPage.split("\n");

    type = $("#type").val();
    if(type == "mvg") {
        if (first) {
            for(let i = 0; i < newPageLines.length; i++) {
                let splitted = newPageLines[i].split(" ");

                let name = "";
                let times = [];
                for(let i1 = 0; i1 < splitted.length; i1++) {
                    let e1 = splitted[i1];
                    if (e1.includes(".") && !e1.match(/[a-z]/i)) {
                        times.push(e1)
                    } else {
                        name += " " + e1;
                    }
                }

                let array = [name];
                timetable.push(array.concat(times))
            }
            first = false;
        } else {
            for(let i = 0; i < newPageLines.length; i++) {
                let splitted = newPageLines[i].split(" ");

                let name = "";
                let times = [];
                for(let i1 = 0; i1 < splitted.length; i1++) {
                    let e1 = splitted[i1];
                    if (e1.includes(".") && !e1.match(/[a-z]/i)) {
                        times.push(e1)
                    } else {
                        name += " " + e1;
                    }
                }

                let existing = timetable[i];
                timetable[i] = existing.concat(times);
            }
        }
    } else if(type == "lvb") {
        if (first) {
            for(let i = 0; i < newPageLines.length; i++) {
                let splitted = newPageLines[i].split(" ");

                let name = "";
                let times = [];
                for(let i1 = 0; i1 < splitted.length; i1++) {
                    let e1 = splitted[i1];
                    if(e1 == ".....") {
                        times.push("|");
                        //console.log(e1+" =>Space");
                    } else if (e1.includes(".") && !e1.match(/[a-z]/i) && !e1.includes("..") && !e1.includes("...")) {
                        times.push(e1);
                        //console.log(e1+" =>Time");
                    } else if(e1.includes("Alle")) {
                        try {
                            if (/^\d+$/.test(splitted[i1 + 1])) {
                                //Found repeat option in this row
                                console.log("should copy times every " + splitted[i1 + 1] + "mins");
                            } else if(/^\d+$/.test(newPageLines[i+1].split(" ")[i1])) {
                                //Found repeat option in next row
                                console.log("should copy times every " + newPageLines[i+1].split(" ")[i1] + "mins");
                            } else {
                                console.log(splitted[i1 + 1] + " => Nope")
                            }
                        } catch(e) {}
                    } else {
                        e1 = e1.replace(/\./g, ""); //Filter points
                        e1 = e1.replace(/Min/g,""); //Filter "Min"
                        name += " " + e1;
                        //console.log(e1 + " =>Name");
                    }
                }

                let array = [name];
                timetable.push(array.concat(times))
            }
            first = false;
        } else {
            for(let i = 0; i < newPageLines.length; i++) {
                let splitted = newPageLines[i].split(" ");

                let name = "";
                let times = [];
                for(let i1 = 0; i1 < splitted.length; i1++) {
                    let e1 = splitted[i1];
                    if (e1.includes(".") && !e1.match(/[a-z]/i)) {
                        times.push(e1);
                    } else if(e1 == ".....") {
                        times.push("|");
                    } else {
                        if(!e1.includes(".."))
                            name += " " + e1;
                    }
                }

                let existing = timetable[i];
                timetable[i] = existing.concat(times);
            }
        }
    }
    console.log(timetable);
    $("#addPageInput").val("");
    Materialize.updateTextFields();
    printToTable()
}

function actionAddSpaces() {
    let selStarti = Math.min(lastClicki, lastEndi);
    let selStartj = Math.min(lastClicki1, lastEndi1);
    let selEndi = Math.max(lastClicki, lastEndi);
    let selEndj = Math.max(lastClicki1, lastEndi1);
    for(let i = selStarti; i <= selEndi; i++) {
        let stop = timetable[i];
        for(let j = 0; j <= (selEndj-selStartj); j++) {
            stop.splice(selStartj, 0, "|")
        }
        timetable[i] = stop;
    }
    lastClicki = -1;
    lastClicki1 = -1;
    lastEndi = -1;
    lastEndi1 = -1;
    printToTable();
}

function actionRemoveSpaces() {
    let selStarti = Math.min(lastClicki, lastEndi);
    let selStartj = Math.min(lastClicki1, lastEndi1);
    let selEndi = Math.max(lastClicki, lastEndi);
    let selEndj = Math.max(lastClicki1, lastEndi1);
    for(let i = selStarti; i <= selEndi; i++) {
        let stop = timetable[i];
        for(let j = 0; j <= (selEndj-selStartj); j++) {
            stop.splice(selStartj, 1)
        }
        timetable[i] = stop;
    }
    lastClicki = -1;
    lastClicki1 = -1;
    lastEndi = -1;
    lastEndi1 = -1;
    printToTable();
}


function printToTable(selStarti, selStarti1, selEndi, selEndi1) {
    $("#timeTable").html("");
    $("#fl_menu").hide();
    for(let i = 0; i < timetable.length; i++) {
        let e = timetable[i];
        $("#timeTable").append("<tr>");
        for(let i1 = 0; i1 < e.length; i1++) {
            let e1 = e[i1]
            if(i1 != 0) {
                if(e1 != "|") {
                    $("#timeTable").append("<td class='bolden' id='cell"+i+"-"+i1+"'>"+e1+"</tdclass>");
                } else {
                    $("#timeTable").append("<td id='cell"+i+"-"+i1+"'>"+e1+"</td>");
                }
                if(i >= selStarti && i <= selEndi && i1 >= selStarti1 && i1 <= selEndi1) $("#cell" + i + "-" + i1).addClass("orange");
                $("#cell"+i+"-"+i1).on("click", function(e) {
                    e.preventDefault();
                    if(e.shiftKey && lastClicki != -1) {
                        console.log("Shiftclick");
                        printToTable(Math.min(lastClicki,i), Math.min(lastClicki1,i1), Math.max(i,lastClicki), Math.max(i1,lastClicki1));
                        let cell = $("#cell"+Math.min(lastClicki, i)+"-"+Math.max(lastClicki1, i1));
                        let pos = cell.offset();
                        pos.left += cell.width()+20;
                        $("#fl_menu").css(pos);
                        $("#fl_menu").show();
                        lastEndi = i;
                        lastEndi1 = i1;
                    } else {
                        console.log("Click");
                        printToTable(i, i1, i, i1);
                        lastClicki = i;
                        lastClicki1 = i1;
                        let cell = $("#cell"+Math.min(lastClicki, i)+"-"+Math.max(lastClicki1, i1));
                        let pos = cell.offset();
                        pos.left += cell.width()+20;
                        $("#fl_menu").css(pos);
                        $("#fl_menu").show();
                        lastEndi = i;
                        lastEndi1 = i1;
                    }

                }).disableSelection();
            } else {
                $("#timeTable").append("<td class='bolden'>"+e1+"</td>");
            }
        }
        $("#timeTable").append("</tr>");
    }
}

function calcTripTypes() {
    var tripTypes = [];
    for(var i = 1; i < biggestArraySize(); i++) {
        var type = []
        for(var j = 0; j < timetable.length; j++) {
            if(timetable[j][i] != "|") {
                type.push(j);
            }
        }
        tripTypes.push(type);
    }
    console.log(tripTypes);

    var uniqueTripTypes = deleteDuplicates(tripTypes);

    trips = uniqueTripTypes;

    $("#times").hide();
    //$("#options").hide();
    $("#tripTypes").show();

    printTripTypes()
}

function backToTable() {
    $("#times").show();
    $("#options").show();
    $("#tripTypes").hide();
}

function deleteDuplicates(A) {
    var hash = {};
    var out = [];
    for (var i = 0, l = A.length; i < l; i++) {
        var key = A[i].join('|');
        if (!hash[key]) {
            out.push(A[i]);
            hash[key] = 'found';
        }
    }
    return out;
}

function printTripTypes() {
    $("#types").html("");
    for(var i = 0; i < trips.length; i++) {
        var startStation = timetable[trips[i][0]][0];
        var endStation = timetable[trips[i][trips[i].length - 1]][0];
        $("#types").append("<button id='btnBack' class='btn orange waves-effect waves-light col s3' onclick='showIntervals("+i+")' type='button'>Intervalle</button>"+startStation+" -> "+endStation+"<br/>")
    }
}

function biggestArraySize() {
    var size = 0;
    for(let i = 0; i < timetable.length; i++) {
        if(timetable[i].length > size) {
            size = timetable[i].length;
        }
    }
    return size;
}

function showIntervals(interval) {
    var tripTypes = [];
    for(var i = 1; i < biggestArraySize(); i++) {
        var type = []
        for(var j = 0; j < timetable.length; j++) {
            if(timetable[j][i] != "|") {
                type.push(j);
            }
        }
        tripTypes.push(type);
    }

    var intervalToCheck = JSON.stringify(trips[interval]);
    var tripTimes = [];
    for(var i = 0; i < tripTypes.length; i++) {
        if(JSON.stringify(tripTypes[i]) == intervalToCheck) {
            var thisTrip = []
            for(var j = 0; j < timetable.length; j++) {
                if(timetable[j][i+1] != "|") {
                    thisTrip.push(timetable[j][i+1]);
                }
            }
            tripTimes.push(thisTrip);
        }
    }

    var intervals = [];
    tripTimes.forEach(function(trip, i, a) {
        intervals[i] = createIntervalString(trip);
    });

    var uniqueIntervals = intervals.filter(function(item, pos) {
        return intervals.indexOf(item) == pos;
    });

    var output = "";
    uniqueIntervals.forEach(function(elem, i, a) {
        output += "["+i+"]: " + elem + "\n";
    });
    var startStation = timetable[trips[interval][0]][0];
    var endStation = timetable[trips[interval][trips[interval].length - 1]][0];
    updateInfo();
    output = "Intervalle fuer: "+startStation+" -> "+endStation+"\n\n"+output;
    output = "Linie "+line+" "+direction+" "+day+" \n\n"+output;
    $("#intervals").html(output);

    output = "";

    uniqueIntervals.forEach(function(interval, i, a) {
        output += i+"("+getIntervalTime(interval)+"m): ";
        tripTimes.forEach(function(trip, j, sa) {
            if(intervals[j] == interval) {
                output += trip[0] + "; ";
            }
        });
        output += "\n";
    });
    output = "Intervall Zeiten\n\n"+output;
    output = output.split(".").join(":")
    $("#intervalTimes").html(output);
    $("#tripTypes").hide();
    $("#intervalTypes").show();
}

function backToTrips() {
    $("#tripTypes").show();
    $("#intervalTypes").hide();
}

function getIntervalTime(string) {
    var times = string.split(", ");
    var time = 0;
    times.forEach(function(e, i, a) {
        if(parseInt(e) <= 200)
            time += parseInt(e);
    });
    return time;
}

function createIntervalString(timeArray) {
    var string = "";
    var preTime = 0;
    timeArray.forEach(function(elem, i, a) {
        if(preTime != 0) {
            var hrsmin = elem.split(".");
            var thistime = parseInt(hrsmin[0])*60 + parseInt(hrsmin[1]);
            var interval = thistime-preTime;
            if(interval < 0) {
                thistime += 1440;
                interval = thistime-preTime;
            }
            preTime = thistime;
            string += interval + ", "
        } else {
            var hrsmin = elem.split(".");
            thistime = parseInt(hrsmin[0])*60 + parseInt(hrsmin[1]);
            preTime = thistime;
        }
    });
    return string;
}

function fillUpRow(rowToFill) {
    var until = biggestArraySize();
    var row = timetable[rowToFill];
    for(var i = row.length; i < until; i++) {
        timetable[rowToFill].push("|")
    }
    printToTable()
}

function fillUpAll() {
    for(var i = 0; i < timetable.length;i++) {
        fillUpRow(i);
    }
}

function save() {
    updateInfo();
    var tosave = JSON.stringify(timetable);
    var blob = new Blob([tosave], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "line"+line+"-"+direction+"-"+day+".json");
}

function load(event) {
    var input = event.target;

    var reader = new FileReader();
    reader.onload = function(file){
        timetable = JSON.parse(reader.result);
        printToTable();
        first = false;
    };
    reader.readAsText(input.files[0]);
    var filename = input.files[0].name;
    console.log(filename);

    var split1 = filename.split(".");
    var split2 = split1[0].split("-");
    $("#line_no").val(split2[0].replace("line",""));
    $("#direction").val(split2[1]);
    $("#day").val(split2[2]);
    Materialize.updateTextFields();
    updateInfo();
}

function togglePage() {
    let addPage = $("#addPage")
    if(addPage.is(":visible")) {
        addPage.hide();
        $("#btnTogglePage").html("<i class=\"mddi mddi-plus-box\"></i> open")
    } else {
        addPage.show();
        $("#btnTogglePage").html("<i class=\"mddi mddi-minus-box\"></i> close")
    }
}