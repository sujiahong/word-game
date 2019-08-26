"use strict";
const TAG = "FailPanel.js";

var cls = {};

cls.extends = cc.Component;

cls.properties = {
    cpLabel: cc.Label,
    garbageScroll: cc.ScrollView,
    homeButton: cc.Button,
    retryButton: cc.Button,
};

cls.onLoad = function(){
    console.log(TAG, "onLoad onLoad");
    this.homeButton.node.on("click", this.onHome, this);
    this.retryButton.node.on("click", this.onRetry, this);
    this.node.on(cc.Node.EventType.TOUCH_START, function(event){
        event.stopPropagation();
    }, this);
    this.node.on(cc.Node.EventType.TOUCH_END, function(event){
        event.stopPropagation();
    }, this);
}

cls.onHome = function(){
    cc.director.loadScene("HomeClassScene");
}

cls.onRetry = function(){

}

cc.Class(cls);