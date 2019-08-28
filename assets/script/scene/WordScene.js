"use strict";
const TAG = "WordScene.js";

if (!cc.g_ada){
    cc.g_ada = {};
}
const g_ada = cc.g_ada;
const constant = require("../share/constant");
const config = require("../model/garbage/GarbageConfig");
const eventEmit = require("../util/event_emit");

var cls = {};

cls.extends = cc.Component;
cls.properties = {
    closeButton: cc.Button,
    diskImg: cc.Sprite,
};

cls.onLoad = function(){
    let self = this;
    this.closeButton.node.on("click", this.onClose, this); 

    // this.garbagePrefab.node.removeFromParent();
    //var player = new Player(cc.g_ada.gameUser.getPlayerInitData());

    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    eventEmit.on("win", function(){
        self.winPanel.active = true;
    });
    eventEmit.on("fail", function(){
        self.failPanel.active = true;
    });

    var b = Math.sin(15);
    var c = Math.cos(15);
    console.log(b, c)
    var posArr = this.getWordPosArr(5);
    for (var i = 0; i < posArr.length; ++i){
        var lab = this.createLabel();
        lab.setPosition(posArr[i]);
        this.diskImg.node.addChild(lab);
    }
}

cls.getWordPosArr = function(num){
    var intervalAngle = 360 / num;
    var arr = [];
    for(var i = 0; i < num; ++i){
        var angle = 162 - intervalAngle*(i+1);
        var radian = angle*Math.PI/180;
        var pos = cc.v2(Math.cos(radian)*150, Math.sin(radian)*150);
        arr.push(pos);
    }
    return arr;
}

cls.createLabel = function(){
    var node = new cc.Node();
    node.color = new cc.Color(0, 255, 0);
    var label = node.addComponent(cc.Label);
    label.string = "东";
    return node;
}

cls.onDestroy = function(){
    eventEmit.off("win");
    eventEmit.off("fail");
}

cls.onTouchStart = function(event){
    this.startLocation = event.getLocation();
    console.log("touch start", this.startLocation.x, this.startLocation.y);
}

cls.onTouchMove = function(event){
    this.moveLocation = event.getLocation();
}

cls.onTouchEnd = function(event){
}

cls.update = function(dt){
}

cls.onClose = function(){
    console.log(TAG, "onClose");
    cc.director.loadScene("HomeClassScene");
}

cc.Class(cls);