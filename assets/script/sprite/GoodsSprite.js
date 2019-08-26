"use strict";
const TAG = "Goods.js";
if (!cc.g_ada){
    cc.g_ada = {};
}
const g_ada = cc.g_ada;

var cls = {};
cls.extends = cc.Component;
cls.properties = {
    keyid: 0,
    type: 0,
    nickname: "",
};

cls.onLoad = function(){
    this.node.on(cc.Node.EventType.TOUCH_START, function(){
        console.log(TAG, "on touch start");
    }, this);
    this.node.on(cc.Node.EventType.TOUCH_END, function(){
        console.log(TAG, "on touch end");
    }, this);
}

cc.Class(cls);