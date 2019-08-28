"use strict";
const TAG = "WordScene.js";

if (!cc.g_ada){
    cc.g_ada = {};
}
const g_ada = cc.g_ada;
const constant = require("../share/constant");
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
    this.haveTouchWordArr = [];
    var posArr = this.getWordPosArr(7);
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
        var angle = 90 - intervalAngle*i;
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
    this.touchLabel = null;
    var startLocation = event.getLocation();
    console.log("touch start", startLocation.x, startLocation.y);
    var arr = this.diskImg.node.getChildren();
    for (var i = 0; i < arr.length; ++i){
        var rect = arr[i].getBoundingBoxToWorld();
        if (rect.contains(startLocation)){
            this.touchLabel = arr[i];
            var node = new cc.Node("line");
            var graph = node.addComponent(cc.Graphics);
            this.touchLabel.addChild(node);
            return;
        }
    }
}

cls.onTouchMove = function(event){
    if (this.touchLabel){
        var moveLocation = event.getLocation();
        var node = this.touchLabel.getChildByName("line");
        var graph = node.getComponent(cc.Graphics);
        graph.clear();
        graph.lineWidth = 10;
        var pos = this.diskImg.node.convertToWorldSpaceAR(this.touchLabel.getPosition());
        console.log(pos.x, pos.y);
        graph.moveTo(0, 0);
        graph.lineTo(moveLocation.x, moveLocation.y);
        graph.strokeColor = new cc.Color(255, 0, 0);
        graph.stroke();
        


    }
}

cls.onTouchEnd = function(event){
    var arr = this.diskImg.node.getChildren();
    console.log(arr);
}

cls.update = function(dt){
}

cls.onClose = function(){
    console.log(TAG, "onClose");
    cc.director.loadScene("HomeClassScene");
}

cc.Class(cls);