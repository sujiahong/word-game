"use strict";
const TAG = "Garbage.js";
if (!cc.g_ada){
    cc.g_ada = {};
}
const g_ada = cc.g_ada;
const config = require("../model/garbage/GarbageConfig");

var cls = {};

const acceleration = 0.01;

cls.extends = cc.Component;
cls.properties = {
    idx: 0,
    keyid: 0,
    type: 0,
    downSpeed: 0,
    acrossSpeed: 0,
};

cls.onLoad = function(){
    this.downSpeed = 5;
}

cls.update = function(){
    this.downSpeed = (this.downSpeed*100 + acceleration*100)/100;
    this.node.y = (this.node.y*100 - this.downSpeed*100)/100;
    if (this.node.y <= config.DOWN_Y){
        this.node.destroy();
        g_ada.room.garbageOpCount++;
        if (g_ada.room.garbageOpCount >= g_ada.room.maxGarbageCount){
            cc.director.emit("win");
        }
    }
}

cls.getAccrossTime = function(){
    console.log("getAccrosstime  :  ", this.downSpeed, this.node.y)
    return (Math.sqrt(this.downSpeed*this.downSpeed*3600+1.2*(this.node.y-config.DOWN_Y)) - this.downSpeed*60)/2;
}

cc.Class(cls);