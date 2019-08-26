"use strict";
const TAG = "ClassificationRoom.js";
const Room = require("../Room");
const config = require("GarbageConfig");
if (!cc.g_ada){
    cc.g_ada = {};
}
const g_ada = cc.g_ada;

class ClassificationRoom extends Room{
    constructor(type){
        super(type);
        this.curLevel = 2;
        this.maxGarbageCount = 0;
        this.garbageClassificationArr = [];
        this.garbageOpCount = 0;
        this.garbageCount = 0;
        this.garbageDataArr = [];
        console.log("ClassificationRoom construct");
    }

    spawnGarbage(){
        var curLevelData = g_ada.levelData[g_ada.curLevel];
        var garbageKeyIdArr = curLevelData.garbage;
        this.maxGarbageCount = garbageKeyIdArr.length;
        for (var i = 0; i < this.maxGarbageCount; ++i){
            var keyid = Number((garbageKeyIdArr[i]== "")?1:garbageKeyIdArr[i]);
            var img = config.GARBAGE_KEYID_2_IMG[keyid];
            var interval = Number((curLevelData.interval[i] == "") ? 0 : curLevelData.interval[i])/1000;
            var type = g_ada.garbageData[keyid + 10000].type;
            this.garbageDataArr.push({keyid: keyid, type: type, img: img, interval: interval});
        }
    }

    getBarbageDataByIndex(idx){
        return this.garbageDataArr[idx];
    }

    isLastGarbage(){
        if (this.garbageCount >=  this.garbageDataArr.length){
            return true;
        }
        return false;
    }

};

module.exports = ClassificationRoom;
