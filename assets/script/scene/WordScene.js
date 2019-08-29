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
    showLabel: cc.Label,
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

cls.createLabel = function(str){
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
    this.haveTouchWordArr = [];
    var startLocation = event.getLocation();
    console.log("touch start", startLocation.x, startLocation.y);
    var labelNode = this.getTouchLabelNode(startLocation);
    if (labelNode){
        this.touchLabel = labelNode;
        this.haveTouchWordArr.push(labelNode);
        var node = new cc.Node("line");
        node.addComponent(cc.Graphics);
        labelNode.addChild(node);
        this.showTouchLabelContent();
    }
}

cls.onTouchMove = function(event){
    if (this.touchLabel){
        var moveLocation = event.getLocation();
        var lineNode = this.touchLabel.getChildByName("line");
        var graph = lineNode.getComponent(cc.Graphics);
        graph.clear();
        graph.lineWidth = 10;
        graph.strokeColor = new cc.Color(255, 0, 0);
        graph.moveTo(0, 0);
        var labelNode = this.getTouchLabelNode(moveLocation);
        if (labelNode && !isHaveTouched(this.haveTouchWordArr, labelNode)){
            var lastNode = this.haveTouchWordArr[this.haveTouchWordArr.length-1];
            if (lastNode.uuid == labelNode.uuid){
                lastNode.removeChild(lastNode.getChildByName("line"));
                //this.haveTouchWordArr.pop();
                lastNode = this.haveTouchWordArr[this.haveTouchWordArr.length-2];
                lastNode.removeChild(lastNode.getChildByName("line"));
                this.touchLabel = labelNode;
                var node = new cc.Node("line");
                node.addComponent(cc.Graphics);
                labelNode.addChild(node);
            }else{
                var worldPos = this.diskImg.node.convertToWorldSpaceAR(labelNode.getPosition());
                var pos = lineNode.parent.convertToNodeSpaceAR(worldPos);
                graph.lineTo(pos.x, pos.y);
                this.touchLabel = labelNode;
                this.haveTouchWordArr.push(labelNode);
                var node = new cc.Node("line");
                node.addComponent(cc.Graphics);
                labelNode.addChild(node);
                graph.stroke();
            }
            this.showTouchLabelContent();
        }else{
            var pos = this.touchLabel.convertToNodeSpaceAR(moveLocation);
            graph.lineTo(pos.x, pos.y);
            graph.stroke();
        }
    }
}

cls.onTouchEnd = function(event){
    var node = this.haveTouchWordArr[this.haveTouchWordArr.length-1];
    node.removeChild(node.getChildByName("line"));

}

cls.getTouchLabelNode = function(location){
    var arr = this.diskImg.node.getChildren();
    for (var i = 0; i < arr.length; ++i){
        var rect = arr[i].getBoundingBoxToWorld();
        if (rect.contains(location)){
            return arr[i];
        }
    }
    return null;
}

cls.showTouchLabelContent = function(){
    var str = "";
    for (var i = 0; i < this.haveTouchWordArr.length; ++i){
        var label = this.haveTouchWordArr[i].getComponent(cc.Label);
        str += label.string;
    }
    this.showLabel.string = str;
}

var isHaveTouched = function(arr, node){
    for (var i = 0; i < arr.length; ++i){
        if (arr[i].uuid == node.uuid){
            return true;
        }
    }
    return false;
}

cls.update = function(dt){
}

cls.onClose = function(){
    console.log(TAG, "onClose");
    cc.director.loadScene("HomeClassScene");
}

cc.Class(cls);