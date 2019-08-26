"use strict";
const TAG = "ui_helper.js";

var exp = module.exports;

exp.isTouchSelf = function(node, touch){

}

exp.isTouchInRech = function(){

}

exp.createFlutterWord = function(str, parentNode){
    var node = new cc.Node();
    var label = node.addComponent(cc.Label);
    label.string = str;
    // label.node.x = 0;
    // label.node.y = 0;
    label.fontSize = 40;
    node.color = new cc.Color(200, 0, 0);
    node.runAction(cc.sequence(
        cc.moveBy(0.5, 0, 50),
        cc.callFunc(function(){
            node.destroy();
        })
    ));
    node.parent = cc.g_ada.persistNode;
    return node;
}
///提示框
exp.createTipsPanel = function(){

}

exp.createSprite = function(){
    let node = new cc.Node("Sprite");
    let sp = node.addComponent(cc.Sprite);
    sp.spriteFrame = this.garbage.spriteFrame;
    node.setContentSize(cc.size(70, 70));
    node.setPosition(0, 355);
    node.color = cc.Color.GREEN;
    node.parent = this.garbage.node.parent;
}