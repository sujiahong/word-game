"use strict";
const TAG = "ClassificationScene.js";

if (!cc.g_ada){
    cc.g_ada = {};
}
const g_ada = cc.g_ada;
const ClassificationRoom = require("../model/garbage/ClassificationRoom");
const constant = require("../share/constant");
const config = require("../model/garbage/GarbageConfig");
const eventEmit = require("../util/event_emit");

var cls = {};

cls.extends = cc.Component;
cls.properties = {
    closeButton: cc.Button,
    garbagePrefab: {
        default: null,
        type: cc.Prefab
    },
    timeLimit: 0,
    timeCount: 0,
    startLocation: null,
    moveLocation: null,
    winPanel: cc.Node,
    failPanel: cc.Node,
};

cls.onLoad = function(){
    let self = this;
    this.closeButton.node.on("click", this.onClose, this); 
    g_ada.room = new ClassificationRoom(constant.ROOM_TYPE.garbage);
    g_ada.room.scene = this;
    g_ada.room.spawnGarbage();
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
    var garbage = g_ada.room.garbageClassificationArr[g_ada.room.garbageOpCount];
    console.log("touch--end ", garbage, g_ada.room.garbageOpCount, g_ada.room.garbageCount);
    if (garbage){
        let gspt = garbage.getComponent("GarbageSprite");
        var time = gspt.getAccrossTime();
        console.log("touch end  ", gspt, garbage.x, garbage.y);
        if (this.moveLocation.x - this.startLocation.x > 10){
            garbage.runAction(cc.moveTo(time, cc.v2(config.RIGHT_X, config.DOWN_Y)));
        }else if (this.moveLocation.x - this.startLocation.x < -10){
            garbage.runAction(cc.moveTo(time, cc.v2(config.LEFT_X, config.DOWN_Y)));
        }
    }
}

cls.update = function(dt){
    this.timeCount += dt;
    if (this.timeCount >= this.timeLimit){
        if (g_ada.room.isLastGarbage()){
            //console.log("all garbage create end end  end");
            this.timeLimit = -1;
        }else{
            var data = g_ada.room.getBarbageDataByIndex(g_ada.room.garbageCount);
            console.log(JSON.stringify(data));
            this.createGarbageSprite(data.keyid, data.type, data.img);
            this.timeCount = 0;
            this.timeLimit = data.interval;
            g_ada.room.garbageCount++;
        }
    }
}

cls.createGarbageSprite = function(keyid, type, img){
    console.log("11111111     ", keyid, type, img)
    var self = this;
    let garbage = cc.instantiate(this.garbagePrefab);
    g_ada.room.garbageClassificationArr.push(garbage);
    garbage.setPosition(0, 700);
    let gspt = garbage.getComponent("GarbageSprite");
    gspt.keyid = keyid;
    gspt.type = type;
    cc.loader.load(cc.url.raw(img), function(err, texture){
        if (err){
            return console.log("createGarbageSprite load err: ", err);
        }
        var spt = garbage.getComponent(cc.Sprite);
        spt.spriteFrame = new cc.SpriteFrame(texture);
        self.node.addChild(garbage);
    });
}

cls.onClose = function(){
    console.log(TAG, "onClose");
    cc.director.loadScene("HomeClassScene");
}

cc.Class(cls);