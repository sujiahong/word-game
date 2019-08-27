const xlsx = require("node-xlsx");
const fs = require("fs");
var level = {};
var list = xlsx.parse("level.xlsx")[0].data;
console.log(list)

var keyItem = list[1];
var typeItem = list[2];
for (var i = 3; i < list.length; ++i){
    var item = list[i];
    var temp = {};
    for(var j = 0; j < keyItem.length; ++j){
        if (typeItem[j] == "arrayint"){
            var arr = item[j].split(";");
            if (arr[arr.length - 1] == "")
                arr.pop();
            temp[keyItem[j]] = arr;
        }else{
            temp[keyItem[j]] = item[j];
        }
    }
    level[item[0]] = temp;
}

console.log(level);

fs.writeFileSync("../assets/resources/json/level.json", JSON.stringify(level));