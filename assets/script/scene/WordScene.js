"use strict";
const TAG = "WordScene.js";

if (!cc.g_ada){
    cc.g_ada = {};
}
const g_ada = cc.g_ada;
g_ada.curLevel = 1;
const constant = require("../share/constant");
const eventEmit = require("../util/event_emit");
var url = cc.url.raw("resources/json/level.json");
cc.loader.load(url, function(err, data){
    if (err == null){
        g_ada.levelData = data.json;
    }
});
var cls = {};
cls.extends = cc.Component;
cls.properties = {
    closeButton: cc.Button,
    diskImg: cc.Sprite,
    showLabel: cc.Label,
    titleLabel: cc.Label,
    sentenceScroll: cc.ScrollView,

    curSentenceIdx: -1,
};

cls.onLoad = function(){
    this.closeButton.node.on("click", this.onClose, this); 
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.sentenceScroll.node.on("scroll-began", function(){
        console.log("scroll began ");
    });
    this.initSentence();
    this.initDisk();
}

cls.initSentence = function(){
    this.sentenceLabelNodeArr = [];
    var curData = g_ada.levelData[g_ada.curLevel];
    this.titleLabel.string = curData.name;
    var scrollContent = this.sentenceScroll.content;
    var lineArr = curData.line;
    var len = lineArr.length;
    scrollContent.height = 100 * len;
    var nodeSize = 50;
    var wi = 0, hi = (scrollContent.height-nodeSize*len) / (len+1);
    console.log(JSON.stringify(scrollContent.getContentSize()))
    for (var i = 0; i < len; ++i){
        var sentence = lineArr[i];
        var slen = sentence.length;
        var y = -((hi+nodeSize/2)*(i+1) + (nodeSize/2)*i);
        var arr = [];
        for (var j = 0; j < slen; ++j){
            wi = (scrollContent.width - nodeSize*slen)/(slen+1);
            var x = -(scrollContent.width/2 - ((wi+nodeSize/2)*(j+1) + (nodeSize/2)*j));
            var labNode = this.createLabel((curData.type[i] == "1") ? sentence[j]: " ");
            labNode.setPosition(cc.v2(x, y));
            scrollContent.addChild(labNode);
            arr.push(labNode);
        }
        this.sentenceLabelNodeArr.push(arr);
    }
}

cls.initDisk = function(){
    this.nextEmptySentence();
    this.haveTouchWordArr = [];
    this.refreshDisk();
}

cls.nextEmptySentence = function(){
    var curData = g_ada.levelData[g_ada.curLevel];
    var typeArr = curData.type;
    for (var i = this.curSentenceIdx+1; i < typeArr.length; ++i){
        if (typeArr[i] == "0"){
            this.curSentenceIdx = i;
            return;
        }
    }
}

var getRandomIndexArr = function(num){
    var arr = [];
    for (var i = 0; i < num; ++i)
        arr.push(i);
    for (i = 0; i < num; ++i){
        var ran = Math.floor(Math.random()*1000%num);
        var tmp = arr[i];
        arr[i] = arr[ran];
        arr[ran] = tmp;
    }
    return arr;
}

cls.refreshDisk = function(){
    this.diskImg.node.removeAllChildren();
    var curData = g_ada.levelData[g_ada.curLevel];
    var wordArr = curData.line[this.curSentenceIdx];
    var wordLen = wordArr.length;
    var posArr = this.getWordPosArr(wordLen);
    var idxArr = getRandomIndexArr(wordLen);
    for (var i = 0; i < wordLen; ++i){
        var lab = this.createLabel(wordArr[idxArr[i]]);
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
    node.setContentSize(40, 40);
    node.color = new cc.Color(0, 255, 0);
    var label = node.addComponent(cc.Label);
    label.string = str;
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
    var touchNode = this.getTouchLabelNode(startLocation);
    if (touchNode){
        this.touchLabel = touchNode;
        this.haveTouchWordArr.push(touchNode);
        var node = new cc.Node("line");
        node.addComponent(cc.Graphics);
        touchNode.addChild(node);
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
        var touchNode = this.getTouchLabelNode(moveLocation);
        if (touchNode && !isHaveTouched(this.haveTouchWordArr, touchNode)){
            var worldPos = this.diskImg.node.convertToWorldSpaceAR(touchNode.getPosition());
            var pos = lineNode.parent.convertToNodeSpaceAR(worldPos);
            graph.lineTo(pos.x, pos.y);
            this.touchLabel = touchNode;
            this.haveTouchWordArr.push(touchNode);
            var node = new cc.Node("line");
            node.addComponent(cc.Graphics);
            touchNode.addChild(node);
            graph.stroke();
            this.showTouchLabelContent();
        }else{
            var pos = this.touchLabel.convertToNodeSpaceAR(moveLocation);
            graph.lineTo(pos.x, pos.y);
            graph.stroke();
            var lastNode = this.haveTouchWordArr[this.haveTouchWordArr.length-2];
            if (lastNode && touchNode){
                if (lastNode.uuid == touchNode.uuid){
                    lastNode.removeChild(lastNode.getChildByName("line"));
                    var node1 = this.haveTouchWordArr[this.haveTouchWordArr.length-1];
                    node1.removeChild(node1.getChildByName("line"));
                    this.haveTouchWordArr.pop();
                    this.touchLabel = lastNode;
                    var node = new cc.Node("line");
                    node.addComponent(cc.Graphics);
                    lastNode.addChild(node);
                    this.showTouchLabelContent();
                }
            }
        }
    }
}

cls.onTouchEnd = function(event){
    var curData = g_ada.levelData[g_ada.curLevel];
    var sentence = curData.line[this.curSentenceIdx];
    if (this.showLabel.string == sentence){
        var nodeLabelArr = this.sentenceLabelNodeArr[this.curSentenceIdx];
        for(var i = 0; i < nodeLabelArr.length; ++i){
            var label = nodeLabelArr[i].addComponent(cc.Label);
            label.string = sentence[i];
        }
        this.nextEmptySentence();
        this.refreshDisk();
        this.showLabel.string = "";
    }else{
        for(var i = 0; i < this.haveTouchWordArr.length; ++i){
            var node = this.haveTouchWordArr[i];
            node.removeChild(node.getChildByName("line"));
        }
        this.haveTouchWordArr = [];
        this.showLabel.string = "";
    }
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