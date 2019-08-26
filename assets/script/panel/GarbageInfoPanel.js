"use strict";
const TAG = "GarbageInfoPanel.js";

var cls = {};

cls.extends = cc.Component;

cls.properties = {
    closeButton: cc.Button,
    garbageImg: cc.Sprite,
    nameLabel: cc.Label,
    descLabel: cc.Label,
    typeLabel: cc.Label,
};

cls.onLoad = function(){
    console.log(TAG, "onLoad onLoad");
    this.closeButton.node.on("click", this.onClose, this);
}

cls.onClose = function(){
    this.node.removeFromParent();
}

cc.Class(cls);