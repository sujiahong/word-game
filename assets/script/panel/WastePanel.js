"use strict";
const TAG = "WastePanel.js";

var cls = {};

cls.extends = cc.Component;

cls.properties = {

};

cls.onLoad = function(){
    console.log(TAG, "onLoad onLoad");
    this.node.on(cc.Node.EventType.TOUCH_START, function(event){
        event.stopPropagation();
    }, this);
    this.node.on(cc.Node.EventType.TOUCH_END, function(event){
        event.stopPropagation();
    }, this);
}

cc.Class(cls);