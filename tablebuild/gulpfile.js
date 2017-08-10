/**
 * Created by yanni on 2017-05-01.
 */
const shell = require('shelljs');
const clc = require('cli-color');
const fs = require('fs');

console.log(clc.green("[Timetables] Start"));
shell.ls("./*.PDF").forEach(file => {
    shell.exec("pdftotext -layout " + file, (code, stdout, stderr) => {
        let timetables = {mofr: [], sa: [], so:[]};
        console.log(clc.bold(clc.greenBright("Processing File: "))+clc.blueBright(file));
        let filecontent = shell.cat(file.replace("PDF", "txt")).stdout;
        let pages = filecontent.split('\f');

        for (let p = 0; p < pages.length; p++) {
            const page = pages[p];
            console.log(clc.magentaBright("Processing Page "+(p+1)+" of "+pages.length+"."))
            let lines = page.split("\n");
            let mode = "";
            let timeBeginsAt = 0;
            let thistable = [];
            let linestodo = [];

            [timeBeginsAt, mode, linestodo] = findModeAndTimesBegin(lines);

            let matchedFirstLine = false;
            let matchedLines = 0;
            for(let i = 0; i < linestodo.length; i++) {
                let line = linestodo[i];
                //console.log("'"+line.substr(0,40)+"'")
                if (line.length != 0 && !line.startsWith(" ") && !line.startsWith("VERKEHRSHINWEIS") && !line.startsWith("Fahrplan") && !line.startsWith("Montag bis Freitag") && !line.startsWith("Samstag") && !line.startsWith("Sonn- und Feiertag")) {
                    matchedFirstLine = true;
                    let thisline = [];
                    thisline.push(line.substr(0, timeBeginsAt).trim());
                    console.log(clc.cyan("Stop: "+line.substr(0, timeBeginsAt).trim()))
                    let time = line.substr(timeBeginsAt);
                    let position = 0;
                    while(time.length > 0) {
                        let match = time.match(/([0-9]|0[0-9]|1[0-9]|2[0-3])\.[0-5][0-9]/);
                        //console.log((position+timeBeginsAt+1)+"- Time: "+match[0]+"@"+match.index+"  Current string: "+time);
                        if(match != null && match.index <= 5) {
                            thisline.push(match[0]);
                            position += match[0].length;
                            while(time.startsWith(" ")) {
                                time = time.substr(1);
                                position++;
                            }
                            time = time.replace(/([0-9]|0[0-9]|1[0-9]|2[0-3])\.[0-5][0-9]/, "");
                        } else {
                            [position,thisline,time] = findSpaces(i, matchedLines, time, position, timeBeginsAt, thisline, linestodo, match);
                        }
                    }
                    thistable.push(thisline);
                    //console.log(clc.magentaBright("Stop finished: "+JSON.stringify(thisline)))
                    //break;
                    matchedLines++;
                } else if((line.startsWith(" ") || line.length == 0) && matchedFirstLine) {
                    //console.log("break");
                    break;
                }
            }
            thistable = fillUpAll(thistable);

            if(mode == "MoFr")
                if (timetables.mofr.length == 0) timetables.mofr = thistable.slice();
                else for (let i = 0; i < timetables.mofr.length; i++) {
                    timetables.mofr[i] = timetables.mofr[i].concat(thistable[i].slice(1));
                    //console.log(thistable[i].slice(1));
                }
            else if(mode == "Sa")
                if (timetables.sa.length == 0) timetables.sa = thistable.slice();
                else for (let i = 0; i < timetables.sa.length; i++)
                    timetables.sa[i] = timetables.sa[i].concat(thistable[i].slice(1));
            else if(mode == "So")
                if (timetables.so.length == 0) timetables.so = thistable.slice();
                else for (let i = 0; i < timetables.so.length; i++)
                    timetables.so[i] = timetables.so[i].concat(thistable[i].slice(1));
        }
        let line = file.split("_")[1];
        let dir = file.split("_")[2] == "1.PDF" ? "inbound":"outbound";
        //console.log(file.split("_"));

        if(JSON.stringify(timetables.mofr) != "[]") fs.writeFile("line"+line+"-"+dir+"-MoFr.json", JSON.stringify(timetables.mofr), err =>{
            if(err) {
                return console.log(err);
            }
            console.log(clc.greenBright("Wrote File: ") + clc.blueBright("line" + line + "-" + dir + "-MoFr.json"));
        });

        if(JSON.stringify(timetables.sa) != "[]") fs.writeFile("line"+line+"-"+dir+"-Sa.json", JSON.stringify(timetables.sa), err =>{
            if(err) {
                return console.log(err);
            }
            console.log(clc.greenBright("Wrote File: ") + clc.blueBright("line" + line + "-" + dir + "-Sa.json"));
        });

        if(JSON.stringify(timetables.so) != "[]") fs.writeFile("line"+line+"-"+dir+"-So.json", JSON.stringify(timetables.so), err =>{
            if(err) {
                return console.log(err);
            }
            console.log(clc.greenBright("Wrote File: ") + clc.blueBright("line" + line + "-" + dir + "-So.json"));
        });
    });
});

function fillUpRow(table, rowToFill, until) {
    if(until == undefined) until = biggestArraySize(table);
    let row = table[rowToFill];
    for(let i = row.length; i < until; i++) {
        table[rowToFill].push("|")
    }
    return table;
}

function fillUpAll(table) {
    let until = biggestArraySize(table);
    for(let i = 0; i < table.length;i++) {
        table = fillUpRow(table, i, until);
    }
    return table;
}

function biggestArraySize(table) {
    let size = 0;
    for(let i = 0; i < table.length; i++)
        if (table[i].length > size)
            size = table[i].length;
    return size;
}

function findModeAndTimesBegin(lines) {
    let timeBeginsAt = 999;
    let mode = "";
    let matchedFirstLine = false;
    let linestodo = [];
    for(const line of lines) {
        //console.log(line.substr(0,30));
        if(line.startsWith("Montag bis Freitag") && mode == "") mode = "MoFr";
        else if(line.startsWith("Samstag") && mode == "") mode = "Sa";
        else if(line.startsWith("Sonn- und Feiertag") && mode == "") mode = "So";
        else if(line.length != 0 && !line.startsWith(" ") && !line.startsWith("VERKEHRSHINWEIS") && !line.startsWith("Fahrplan") && !line.startsWith("Montag bis Freitag") && !line.startsWith("Samstag") && !line.startsWith("Sonn- und Feiertag")) {
            let match = /([0-9]|0[0-9]|1[0-9]|2[0-3])\.[0-5][0-9]/igm.exec(line);
            if(match != null && match.index != 0 && match.index < timeBeginsAt) {
                timeBeginsAt = match.index;
            }
            linestodo.push(line);
            matchedFirstLine = true;
        } else if((line.startsWith(" ") || line.length == 0) && matchedFirstLine) {
            break;
        }
    }
    console.log(clc.redBright("Time begins at char: "+timeBeginsAt));
    console.log(clc.redBright("Mode: "+mode));
    console.log(clc.redBright("Processing "+linestodo.length+" Stops."));

    return [timeBeginsAt, mode, linestodo];
}

function findSpaces(i, matchedLines, time, position, timeBeginsAt, thisline, linestodo, match) {
    let amountFound = 0;
    let amountFoundUntil = 0;
    //console.log("-- Tracing spaces down...");
    let found = false;
    let indextry = 1;
    while(!found && i+indextry+1 <= linestodo.length) {
        //console.log(i+indextry+"--"+linestodo.length);
        let string = linestodo[i + indextry].substr(timeBeginsAt+position,match.index);
        if(string.trim() != "") {
            //console.log('-- Testing: "'+string+'"');
            let complString = linestodo[i + indextry].substr(timeBeginsAt, position+match.index);
            let amount = 0;
            let amountUntil = 0;
            try { amount = string.match(/([0-9]|0[0-9]|1[0-9]|2[0-3])\.[0-5][0-9]/g).length;} catch(e) {}
            try { amountUntil = complString.match(/([0-9]|0[0-9]|1[0-9]|2[0-3])\.[0-5][0-9]/g).length;} catch(e) {}
            //console.log(clc.greenBright("--- Found "+amount+" spaces. Adding them."))
            //position += amount * 7;
            //found = true;
            if(amount > amountFound) amountFound = amount;
            if(amountUntil > amountFoundUntil) amountFoundUntil = amountUntil;
            indextry++;
        } else {
            //console.log(clc.greenBright("--| Found no spaces. Testing next line."))
            indextry++;
        }
    }
    //console.log("-- Tracing spaces up...");
    indextry = 1;
    while(!found && i-indextry > 0) {
            let string = linestodo[i - indextry].substr(timeBeginsAt+position,match.index);
            if(string.trim() != "") {
                //console.log('-- Testing: "'+string+'"');
                let complString = linestodo[i - indextry].substr(timeBeginsAt, position+match.index);
                let amount = 0;
                let amountUntil = 0;
                try { amount = string.match(/([0-9]|0[0-9]|1[0-9]|2[0-3])\.[0-5][0-9]/g).length;} catch(e) {}
                try { amountUntil = complString.match(/([0-9]|0[0-9]|1[0-9]|2[0-3])\.[0-5][0-9]/g).length;} catch(e) {}
                //console.log(clc.greenBright("--- Found "+amount+" spaces. Adding them."))
                //position += amount * 7;
                //found = true;
                if(amount > amountFound) amountFound = amount;
                if(amountUntil > amountFoundUntil) amountFoundUntil = amountUntil;
                indextry++;
            } else {
                //console.log(clc.greenBright("--| Found no spaces. Testing next line."))
                indextry++;
            }
            //console.log(clc.redBright("-| Trace finished. Nothing found."))
    }
    console.log("Found "+amountFound+" spaces. Max was "+amountFoundUntil+"; Length: "+(thisline.length-1));
    if(amountFoundUntil != amountFound + thisline.length-1) {
        amountFound = amountFoundUntil - thisline.length - 1;
        console.log("Corrected to "+amountFound+" spaces.");
    }

    for (let x = 0; x < amountFound; x++) {
        //console.log("Add");
        thisline.push("|");
    }
    while(time.startsWith(" ")) {
        time = time.substr(1);
        position++;
    }
    return [position,thisline,time];
}