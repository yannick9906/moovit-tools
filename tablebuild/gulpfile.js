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

        for (const page of pages) {
            let lines = page.split("\n");
            let mode = "";
            let timeBeginsAt = 999;
            let thistable = [];
            let linestodo = [];
            let matchedFirstLine = false;

            for(const line of lines) {
                if(line.startsWith("Montag bis Freitag") && mode == "") mode = "MoFr";
                else if(line.startsWith("Samstag") && mode == "") mode = "Sa";
                else if(line.startsWith("Sonn- und Feiertag" && mode == "")) mode = "So";
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

            matchedFirstLine = false;
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
                        console.log((position+timeBeginsAt+1)+"- Time: "+match[0]+"@"+match.index+"  Current string: "+time);
                        if(match != null && match.index <= 5) {
                            thisline.push(match[0]);
                            position += match[0].length;
                            while(time.startsWith(" ")) {
                                time = time.substr(1);
                                position++;
                            }
                            time = time.replace(/([0-9]|0[0-9]|1[0-9]|2[0-3])\.[0-5][0-9]/, "");
                        } else {
                            if(matchedLines > 0) {
                                console.log("-- Tracing spaces down...");
                                let found = false;
                                let indextry = 1;
                                while(!found) {
                                    try {
                                        let string = linestodo[i + indextry].substr(timeBeginsAt+position,match.index);
                                        if(string.trim() != "") {
                                            console.log('-- Testing: "'+string+'"');
                                            let amount = string.match(/([0-9]|0[0-9]|1[0-9]|2[0-3])\.[0-5][0-9]/g).length;
                                            console.log(clc.greenBright("--- Found "+amount+" spaces. Adding them."))
                                            for (let x = 0; x < amount; x++) {
                                                thisline.push("|");
                                            }
                                            while(time.startsWith(" ")) {
                                                time = time.substr(1);
                                                position++;
                                            }
                                            //position += amount * 7;
                                            found = true;
                                        } else {
                                            //console.log(clc.greenBright("--| Found no spaces. Testing next line."))
                                            indextry++;
                                        }
                                    } catch(e) {
                                        console.log("-- Tracing spaces up...");
                                        let indextry = 1;
                                        while(!found) {
                                            try {
                                                let string = linestodo[i - indextry].substr(timeBeginsAt+position,match.index);
                                                if(string.trim() != "") {
                                                    console.log('-- Testing: "'+string+'"');
                                                    let amount = string.match(/([0-9]|0[0-9]|1[0-9]|2[0-3])\.[0-5][0-9]/g).length;
                                                    console.log(clc.greenBright("--- Found "+amount+" spaces. Adding them."))
                                                    for (let x = 0; x < amount; x++) {
                                                        thisline.push("|");
                                                    }
                                                    while(time.startsWith(" ")) {
                                                        time = time.substr(1);
                                                        position++;
                                                    }
                                                    //position += amount * 7;
                                                    found = true;
                                                } else {
                                                    //console.log(clc.greenBright("--| Found no spaces. Testing next line."))
                                                    indextry++;
                                                }
                                            } catch(e) {
                                                console.log(clc.redBright("-| Trace finished. Nothing found."))
                                                found = true;
                                                while(time.startsWith(" ")) {
                                                    time = time.substr(1);
                                                    position++;
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                console.log("-- Tracing spaces down...");
                                let found = false;
                                let indextry = 1;
                                while(!found) {
                                    try {
                                        let string = linestodo[i + indextry].substr(timeBeginsAt+position,match.index);
                                        if(string.trim() != "") {
                                            console.log('-- Testing: "'+string+'"');
                                            let amount = string.match(/([0-9]|0[0-9]|1[0-9]|2[0-3])\.[0-5][0-9]/g).length;
                                            time = time.trim();
                                            console.log(clc.greenBright("--- Found "+amount+" spaces. Adding them."))
                                            for (let x = 0; x < amount; x++) {
                                                thisline.push("|");
                                            }
                                            while(time.startsWith(" ")) {
                                                time = time.substr(1);
                                                position++;
                                            }
                                            //position += amount * 7;
                                            found = true;
                                        } else {
                                            //console.log(clc.greenBright("--| Found no spaces. Testing next line."))
                                            indextry++;
                                        }
                                    } catch(e) {
                                        console.log(clc.redBright("-| Trace finished. Nothing found."))
                                        found = true;
                                        while(time.startsWith(" ")) {
                                            time = time.substr(1);
                                            position++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    thistable.push(thisline);
                    console.log(clc.magentaBright("Stop finished: "+JSON.stringify(thisline)))
                    //break;
                    matchedLines++;
                } else if((line.startsWith(" ") || line.length == 0) && matchedFirstLine) {
                    //console.log("break");
                    break;
                }
            }
            if(mode == "MoFr")
                if (timetables.mofr.length == 0) timetables.mofr = thistable.slice();
                else for (let i = 0; i < timetables.mofr.length; i++)
                    timetables.mofr[i].concat(thistable[0].slice(1));
            else if(mode == "Sa")
                if (timetables.sa.length == 0) timetables.sa = thistable.slice();
                else for (let i = 0; i < timetables.sa.length; i++)
                    timetables.sa[i].concat(thistable[0].slice(1));
            else if(mode == "So")
                if (timetables.so.length == 0) timetables.so = thistable.slice();
                else for (let i = 0; i < timetables.so.length; i++)
                    timetables.so[i].concat(thistable[0].slice(1));
            break;
        }
        let line = file.split("_")[1];
        let dir = file.split("_")[2] == 1 ? "inbound":"outbound";

        fs.writeFile("line"+line+"-"+dir+"-MoFr.json", JSON.stringify(timetables.mofr), err =>{
            if(err) {
                return console.log(err);
            }
        });

        fs.writeFile("line"+line+"-"+dir+"-Sa.json", JSON.stringify(timetables.sa), err =>{
            if(err) {
                return console.log(err);
            }
        });

        fs.writeFile("line"+line+"-"+dir+"-So.json", JSON.stringify(timetables.so), err =>{
            if(err) {
                return console.log(err);
            }
        });
    });
});