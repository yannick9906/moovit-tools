/**
 * Created by yanni on 2017-02-25.
 */
var timetable = [];
var trips = [];
var first = true;
var lastClick = -1;
var line = 0;
var direction = "in";
var day = "MoFr";

$(document).ready(function() {
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
    var newPage = $("#addPageInput").val();
    newPage = newPage.replace(/u¨/g, "ü");
    newPage = newPage.replace(/a¨/g, "ä");
    newPage = newPage.replace(/o¨/g, "ö");
    newPage = newPage.replace(/\n$/, "");
    var newPageLines = newPage.split("\n");

    if(first) {
        newPageLines.forEach(function (e, i, a) {
            var splitted = e.split(" ");
            var name = "";
            var times = [];
            splitted.forEach(function (e1, i1, a1) {
                if (e1.includes(".") && !e1.match(/[a-z]/i)) {
                    times.push(e1)
                } else {
                    name += " " + e1;
                }
            })
            var array = [name];
            timetable.push(array.concat(times))
        });
        first = false;
    } else {
        newPageLines.forEach(function (e, i, a) {
            var splitted = e.split(" ");
            var name = "";
            var times = [];
            splitted.forEach(function (e1, i1, a1) {
                if (e1.includes(".") && !e1.match(/[a-z]/i)) {
                    times.push(e1)
                } else {
                    name += " " + e1;
                }
            });
            var existing = timetable[i];
            timetable[i] = existing.concat(times);
        });
    }
    console.log(timetable)
    $("#addPageInput").val("");
    Materialize.updateTextFields();
    printToTable()
}

function addSpace(e ,i, i1) {
    e.preventDefault();
    if(e.shiftKey && lastClick != -1) {
        if(i >= lastClick) {
            for(var j = lastClick+1; j <= i; j++) {
                var stop = timetable[j];
                stop.splice(i1, 0, "|")
                timetable[j] = stop;
            }
        } else {
            for(var j = i; j < lastClick; j++) {
                var stop = timetable[j];
                stop.splice(i1, 0, "|")
                timetable[j] = stop;
            }
        }
        lastClick = -1;
    } else {
        var stop = timetable[i];
        stop.splice(i1, 0, "|")
        timetable[i] = stop;
        lastClick = i;
    }
    printToTable();
}

function removeSpace(e ,i, i1) {
    if(e.shiftKey && lastClick != -1) {
        if(i >= lastClick) {
            for(var j = lastClick; j < i; j++) {
                var stop = timetable[j];
                stop.splice(i1, 1)
                timetable[j] = stop;
            }
        } else {
            for(var j = i; j < lastClick; j++) {
                var stop = timetable[j];
                stop.splice(i1, 1)
                timetable[j] = stop;
            }
        }
        lastClick = -1;
    } else {
        var stop = timetable[i];
        stop.splice(i1, 1)
        timetable[i] = stop;
        lastClick = i;
    }
    printToTable();
}

function printToTable() {
    $("#timeTable").html("");
    timetable.forEach(function(e, i, a) {
        $("#timeTable").append("<tr>");
        e.forEach(function(e1, i1, a1) {
            if(i1 != 0) {
                if(e1 != "|") {
                    $("#timeTable").append("<td class='bolden'><a class='green-text bolden' onclick='addSpace(event,"+i+","+i1+")'>+</a>"+e1+"</tdclass>");
                } else {
                    $("#timeTable").append("<td><a class='red-text bolden' onclick='removeSpace(event,"+i+","+i1+")'>-</a>"+e1+"</td>");
                }
            } else {
                $("#timeTable").append("<td>"+e1+"</td>");
            }
        });
        $("#timeTable").append("</tr>");
    });
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
    timetable.forEach(function(e, i, a) {
        if(e.length > size) {
            size = e.length;
        }
    });
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