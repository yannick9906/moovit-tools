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
let history = [];
let currentInterval;
let upperLimit = 0;
let lowerLimit = 999;

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

    $(window).on("keyup", function(e) {
        let evtobj = window.event? event : e;
        if (evtobj.keyCode == 90 && evtobj.ctrlKey) undoAction();
    });
});

function takeSnapshot() {
    if(history.length >= 20)
        history.shift();
    history.push(JSON.parse(JSON.stringify(timetable)));
    console.log(timetable);
    console.log("took snapshot");
}

function undoAction() {
    timetable = history.pop();
    if(timetable.length == 0) first = true;
    console.log("Undo");
    printToTable();
}

function updateInfo() {
    line = $("#line_no").val();
    direction = $("#direction").val();
    day = $("#day").val();
}

function addPage() {
    takeSnapshot();
    let newPage = $("#addPageInput").val();
    newPage = newPage.replace(/u¨/g, "ü");
    newPage = newPage.replace(/a¨/g, "ä");
    newPage = newPage.replace(/o¨/g, "ö");
    newPage = newPage.replace(//g, "");
    newPage = newPage.replace(/ð/g, "");
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
                    if(e1 == "....." || e1 == "|") {
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
                    if(e1.includes("Li.") || e1.includes("Gleis")) {
                        i1++;
                    } else if(e1.includes("SEV")) {

                    } else if(e1 == "....." || e1 == "|") {
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
                                i1++;
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
    takeSnapshot();
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

function actionAddSpacedSpaces() {
    takeSnapshot();
    let selStarti = Math.min(lastClicki, lastEndi);
    let selStartj = Math.min(lastClicki1, lastEndi1);
    let selEndi = Math.max(lastClicki, lastEndi);
    let selEndj = Math.max(lastClicki1, lastEndi1);
    for(let i = selStarti; i <= selEndi; i++) {
        let stop = timetable[i];
        for(let j = 0; j <= (selEndj-selStartj); j++) {
            stop.splice(selStartj+2*j, 0, "|")
        }
        timetable[i] = stop;
    }
    lastClicki = -1;
    lastClicki1 = -1;
    lastEndi = -1;
    lastEndi1 = -1;
    printToTable();
}

function actionAddSpaced21Spaces() {
    takeSnapshot();
    let selStarti = Math.min(lastClicki, lastEndi);
    let selStartj = Math.min(lastClicki1, lastEndi1);
    let selEndi = Math.max(lastClicki, lastEndi);
    let selEndj = Math.max(lastClicki1, lastEndi1);
    for(let i = selStarti; i <= selEndi; i++) {
        let stop = timetable[i];
        for(let j = 0; j <= (selEndj-selStartj)-((selEndj-selStartj)/2); j++) {
            stop.splice(selStartj+3*j, 0, "|");
        }
        timetable[i] = stop;
    }
    lastClicki = -1;
    lastClicki1 = -1;
    lastEndi = -1;
    lastEndi1 = -1;
    printToTable();
}

function actionAddSpaced12Spaces() {
    takeSnapshot();
    let selStarti = Math.min(lastClicki, lastEndi);
    let selStartj = Math.min(lastClicki1, lastEndi1);
    let selEndi = Math.max(lastClicki, lastEndi);
    let selEndj = Math.max(lastClicki1, lastEndi1);
    for(let i = selStarti; i <= selEndi; i++) {
        let stop = timetable[i];
        for(let j = 0; j <= (selEndj-selStartj); j++) {
            stop.splice(selStartj+3*j, 0, "|");
            stop.splice(selStartj+3*j, 0, "|");
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
    takeSnapshot();
    let selStarti = Math.min(lastClicki, lastEndi);
    let selStartj = Math.min(lastClicki1, lastEndi1);
    let selEndi = Math.max(lastClicki, lastEndi);
    let selEndj = Math.max(lastClicki1, lastEndi1);
    for(let i = selStarti; i <= selEndi; i++) {
        let stop = timetable[i];
        for(let j = 0; j <= (selEndj-selStartj); j++) {
            stop.splice(selStartj, 1);
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
            let e1 = e[i1];
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
    let tripTypes = [];
    for(let i = 1; i < biggestArraySize(); i++) {
        let type = [];
        for(let j = 0; j < timetable.length; j++) {
            if(timetable[j][i] != "|") {
                type.push(j);
            }
        }
        tripTypes.push(type);
    }
    console.log(tripTypes);

    trips = deleteDuplicates(tripTypes);

    $("#times").hide();
    $("#tripTypes").show();

    printTripTypes()
}

function backToTable() {
    $("#times").show();
    $("#options").show();
    $("#tripTypes").hide();
}

function deleteDuplicates(A) {
    let hash = {};
    let out = [];
    for (let i = 0, l = A.length; i < l; i++) {
        let key = A[i].join('|');
        if (!hash[key]) {
            out.push(A[i]);
            hash[key] = 'found';
        }
    }
    return out;
}

function printTripTypes() {
    $("#types").html("");
    for(let i = 0; i < trips.length; i++) {
        let startStation = timetable[trips[i][0]][0];
        let endStation = timetable[trips[i][trips[i].length - 1]][0];
        $("#types").append("<p class='col s12'><input style='margin-top: 7px' type='checkbox' id='chk"+i+"' /><label style='margin-top: 7px;' for='chk"+i+"'>"+startStation+" -> "+endStation+"&nbsp;</label><button id='' class='btn orange waves-effect waves-light left' onclick='showIntervals("+i+")' type='button'>Intervalle</button></p>")
    }
}

function biggestArraySize(t) {
    let croppedTimetable;
    if(t) croppedTimetable = t;
    else croppedTimetable = timetable;
    let size = 0;
    for(let i = 0; i < croppedTimetable.length; i++) {
        if(croppedTimetable[i].length > size) {
            size = croppedTimetable[i].length;
        }
    }
    return size;
}

function showIntervals(interval) {
    fillStartAndEndStationSelect();
    currentInterval = interval;
    let croppedTimetable = timetable.slice(upperLimit, lowerLimit+1);

    let tripTypes = [];
    for(let i = 1; i < biggestArraySize(); i++) {
        let type = [];
        for(let j = 0; j < croppedTimetable.length; j++) {
            if(croppedTimetable[j][i] != "|") {
                type.push(j);
            }
        }
        tripTypes.push(type);
    }
    //console.log(tripTypes);

    let trips = deleteDuplicates(tripTypes);

    console.log(croppedTimetable);
    for(let i = 1; i < biggestArraySize(croppedTimetable); i++) {
        let type = [];
        for(let j = 0; j < croppedTimetable.length; j++) {
            if(croppedTimetable[j][i] != "|") {
                type.push(j);
            }
        }
        tripTypes.push(type);
    }

    let intervalToCheck = JSON.stringify(trips[interval]);
    let tripTimes = [];
    for(let i = 0; i < tripTypes.length; i++) {
        if(JSON.stringify(tripTypes[i]) == intervalToCheck) {
            let thisTrip = [];
            for(let j = 0; j < croppedTimetable.length; j++) {
                if(croppedTimetable[j][i+1] != "|") {
                    thisTrip.push(croppedTimetable[j][i+1]);
                }
            }
            tripTimes.push(thisTrip);
        }
    }

    let intervals = [];
    console.log(tripTimes);
    tripTimes.forEach(function(trip, i) {
        if(trip[0] != undefined) intervals[i] = createIntervalString(trip);
    });

    let uniqueIntervals = intervals.filter(function(item, pos) {
        return intervals.indexOf(item) == pos;
    });

    let output = "";
    uniqueIntervals.forEach(function(elem, i) {
        output += "["+i+"]: " + elem + "\n";
    });
    let startStation = croppedTimetable[trips[interval][0]][0];
    let endStation = croppedTimetable[trips[interval][trips[interval].length - 1]][0];
    updateInfo();
    output = "Intervalle fuer: "+startStation+" -> "+endStation+"\n\n"+output;
    output = "Linie "+line+" "+direction+" "+day+" \n\n"+output;
    $("#intervals").html(output);

    output = "";

    uniqueIntervals.forEach(function(interval, i) {
        output += i+"("+getIntervalTime(interval)+"m): ";
        tripTimes.forEach(function(trip, j) {
            if(intervals[j] == interval) {
                output += trip[0] + "; ";
            }
        });
        output += "\n";
    });
    output = "Intervall Zeiten\n\n"+output;
    output = output.split(".").join(":");
    $("#intervalTimes").html(output);
    $("#tripTypes").hide();
    $("#intervalTypes").show();
}

function backToTrips() {
    $("#tripTypes").show();
    $("#intervalTypes").hide();
}

function getIntervalTime(string) {
    let times = string.split(", ");
    let time = 0;
    times.forEach(function(e) {
        if(parseInt(e) <= 200)
            time += parseInt(e);
    });
    return time;
}

function createIntervalString(timeArray) {
    let string = "";
    let preTime = 0;
    timeArray.forEach(function(elem) {
        if(preTime != 0) {
            let hrsmin = elem.split(".");
            let thistime = parseInt(hrsmin[0])*60 + parseInt(hrsmin[1]);
            let interval = thistime-preTime;
            if(interval < 0) {
                thistime += 1440;
                interval = thistime-preTime;
            }
            preTime = thistime;
            string += interval + ", "
        } else {
            let hrsmin = elem.split(".");
            preTime = parseInt(hrsmin[0]) * 60 + parseInt(hrsmin[1]);
        }
    });
    return string;
}

function fillStartAndEndStationSelect() {
    $("#startstation").html("");
    $("#endstation").html("");
    timetable.forEach((e, i) => {
        if(upperLimit == i) $("#startstation").append("<option selected value='"+i+"'>"+e[0]+"</option>");
        else  $("#startstation").append("<option value='"+i+"'>"+e[0]+"</option>");
        if((lowerLimit == 999 && i == timetable.length-1) || (lowerLimit != 999 && i == lowerLimit)) $("#endstation").append("<option selected value='"+i+"'>"+e[0]+"</option>");
        else $("#endstation").append("<option value='"+i+"'>"+e[0]+"</option>");
    });
    $("#startstation").material_select();
    $("#endstation").material_select();

    $("#startstation").change(() => {
        setUpperLimit($("#startstation").val())
    });
    $("#endstation").change(() => {
        setLowerLimit($("#endstation").val())
    });
}

function setUpperLimit(i) {
    console.log("Triggerd: u" + i);
    upperLimit = parseInt(i);
    showIntervals(currentInterval);
}

function setLowerLimit(i) {
    console.log("Triggerd: l" + i);
    lowerLimit = parseInt(i);
    showIntervals(currentInterval);
}

function fillUpRow(rowToFill) {
    let until = biggestArraySize();
    let row = timetable[rowToFill];
    for(let i = row.length; i < until; i++) {
        timetable[rowToFill].push("|")
    }
    printToTable()
}

function fillUpAll() {
    takeSnapshot();
    let progressbar = $("#progress");
    progressbar.css("width",0)
    let i = 0;
    let process = () => {
        console.log((i / timetable.length) * 100 + "%");
        progressbar.css("width", (i / timetable.length)*100 + "%");
        fillUpRow(i);
        if(i < timetable.length) {
            i++;
            setTimeout(process, 5)
        }
    }
    process();
}

function save() {
    updateInfo();
    let tosave = JSON.stringify(timetable);
    let blob = new Blob([tosave], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "line"+line+"-"+direction+"-"+day+".json");
}

function load(event) {
    takeSnapshot();
    let input = event.target;

    let reader = new FileReader();
    reader.onload = function(file){
        timetable = JSON.parse(reader.result);
        printToTable();
        first = false;
    };
    reader.readAsText(input.files[0]);
    let filename = input.files[0].name;
    console.log(filename);

    let split1 = filename.split(".");
    let split2 = split1[0].split("-");
    $("#line_no").val(split2[0].replace("line",""));
    $("#direction").val(split2[1]);
    $("#day").val(split2[2]);
    Materialize.updateTextFields();
    updateInfo();
}

function togglePage() {
    let addPage = $("#addPage");
    if(addPage.is(":visible")) {
        addPage.hide();
        $("#btnTogglePage").html("<i class=\"mddi mddi-plus-box\"></i> open");
    } else {
        addPage.show();
        $("#btnTogglePage").html("<i class=\"mddi mddi-minus-box\"></i> close");
    }
}