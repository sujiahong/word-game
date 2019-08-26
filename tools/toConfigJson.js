const xlsx = require("node-xlsx");
const fs = require("fs");
var config = {};
var list = xlsx.parse("config.xlsx");
console.log(list, list.length)
var data = list[0].data;
for(var i = 2; i < data.length; ++i){
    var item = data[i];
    config[item[0]] = item[2];
}

fs.writeFileSync("../assets/resources/json/config.json", JSON.stringify(config));