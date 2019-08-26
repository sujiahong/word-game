"use strict";
const TAG = "HomeClassScene.js";

if (!cc.g_ada){
    cc.g_ada = {};
}
const g_ada = cc.g_ada;
const constant = require("../share/constant");
const config = require("../model/garbage/GarbageConfig");
const util = require("../util/util");
g_ada.curLevel = Number(util.getLocalStore("CUR_LEVEL") || 1);


var cls = {};

cls.extends = cc.Component;
cls.properties = {
    startButton: cc.Button,
    userAvatar: cc.Sprite,
    nameLabel: cc.Label,
    strengthAvatar: cc.Sprite,
    strengthLabel: cc.Label,
    redAvatar: cc.Sprite,
    redLabel: cc.Label,
    rankButton: cc.Button,
    wasteButton: cc.Button,
    startPanel: cc.Node,
};

cls.onLoad = function(){
    console.log(TAG, "onLoad !");
    if (typeof wx === undefined)
        return;
    this.startButton.node.on("click", this.onStart, this);
    this.rankButton.node.on("click", this.onRank, this);
    this.wasteButton.node.on("click", this.onWaste, this);
    var url = cc.url.raw("resources/json/level.json");
    cc.loader.load(url, function(err, data){
        if (err == null){
            g_ada.levelData = data.json;
        }
    });
    url = cc.url.raw("resources/json/garbage.json");
    cc.loader.load(url, function(err, data){
        if (err == null){
            g_ada.garbageData = data.json;
        }
    });
}

cls.onStart = function(){
    console.log(TAG, "onStart!!");
    this.startPanel.active = true;
    var panel = this.startPanel.getComponent("StartGamePanel");
    panel.nameLabel.string = "第 " + g_ada.curLevel + " 关";

}

cls.onRank = function(){
    console.log(TAG, "onRank!!");
}

cls.onWaste = function(){
    console.log(TAG, "onWaste!!");
}

cc.Class(cls);