"use strict";
const TAG = "WordScene.js";

if (!cc.g_ada){
    cc.g_ada = {};
}
const g_ada = cc.g_ada;
g_ada.curLevel = 1;
//const constant = require("../share/constant");
//const eventEmit = require("../util/event_emit");
let touchTex = null;
cc.loader.loadRes("UI/main/pan_word", function(err, tex){
    if (err == null){
        touchTex = tex;
    }
});
let wordTex = null;
cc.loader.loadRes("UI/main/word", function(err, tex){
    if (err == null){
        wordTex = tex;
    }
});
let lineTex = null;
cc.loader.loadRes("UI/main/words4", function(err, tex){
    console.log("22222   ", err, tex)
    if (err == null){
        lineTex = tex;
    }
});
var cls = {};
cls.extends = cc.Component;
cls.properties = {
    homeNode: cc.Node,
    powerLabel: cc.Label,
    timeLabel: cc.Label,
    shareButton: cc.Button,
    levelButton: cc.Button,
    levelBtnLabel: cc.Label,
    homeRankButton: cc.Button,

    wordNode: cc.Node,
    backButton: cc.Button,
    rankButton: cc.Button,
    refreshButton: cc.Button,
    hintButton: cc.Button,
    diskImg: cc.Sprite,
    showSpt: cc.Sprite,
    showLabel: cc.Label,
    levelLabel: cc.Label,
    titleLabel: cc.Label,
    authorLabel: cc.Label,
    sentenceScroll: cc.ScrollView,
    wordLabelPrefab: cc.Prefab,
    explainSpt: cc.Sprite,
    explainLabel: cc.Label,

    curSentenceIdx: -1,
};

cls.onLoad = function(){
    var self =  this;
    this.shareButton.node.on("click", this.onShare, this);
    this.levelButton.node.on("click", this.onLevel, this);
    this.homeRankButton.node.on("click", this.onRank, this);

    this.backButton.node.on("click", this.onBack, this);
    this.rankButton.node.on("click", this.onRank, this);
    this.refreshButton.node.on("click", this.onRefresh, this);
    this.hintButton.node.on("click", this.onHint, this); 
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.sentenceScroll.node.on("scroll-began", function(){
        console.log("scroll began ");
    });
    this.initHome();
    cc.loader.loadRes("config/level", function(err, data){
        console.log("77777777 ", err, data)
        if (err == null){
            g_ada.levelData = data.json;
            self.initSentence();
            self.nextEmptySentence();
            self.initDisk();
        }
    });

}

cls.initHome = function(){
    this.levelBtnLabel.string = "第 " + g_ada.curLevel + " 关";
}

cls.initSentence = function(){
    this.sentenceLabelNodeArr = [];
    this.levelLabel.string = "第 " + g_ada.curLevel + " 关";
    var curData = g_ada.levelData[g_ada.curLevel];
    this.titleLabel.string = curData.name;
    this.authorLabel.string = curData.author;
    var scrollContent = this.sentenceScroll.content;
    scrollContent.removeAllChildren();
    var lineArr = curData.line;
    var len = lineArr.length;
    scrollContent.height = 120 * len;
    var nodeSize = 50;
    var wi = 0, hi = (scrollContent.height-nodeSize*len) / (len+1);
    for (var i = 0; i < len; ++i){
        var sentence = lineArr[i];
        var slen = sentence.length;
        var y = -((hi+nodeSize/2)*(i+1) + (nodeSize/2)*i);
        var arr = [];
        for (var j = 0; j < slen; ++j){
            wi = (scrollContent.width - nodeSize*slen)/(slen+1);
            var x = -(scrollContent.width/2 - ((wi+nodeSize/2)*(j+1) + (nodeSize/2)*j));
            var labNode = this.createShowWordLabel((curData.type[i] == "1") ? sentence[j]: "");
            if (j == slen-1 && curData.type[i] == "0"){
                var btn = labNode.getChildByName("question_button");
                btn.on("click", this.onQuestion, this);
            }
            labNode.setPosition(cc.v2(x, y));
            scrollContent.addChild(labNode);
            arr.push(labNode);
        }
        this.sentenceLabelNodeArr.push(arr);
    }
}

cls.initDisk = function(){
    this.haveTouchWordArr = [];
    this.refreshDisk();
}

cls.nextEmptySentence = function(){
    if (this.curSentenceIdx >= 0){
        var arr = this.sentenceLabelNodeArr[this.curSentenceIdx];
        var labNode = arr[arr.length -1];
        var btn = labNode.getChildByName("question_button");
        btn.active = false;
    }
    var curData = g_ada.levelData[g_ada.curLevel];
    var typeArr = curData.type;
    for (var i = this.curSentenceIdx+1; i < typeArr.length; ++i){
        if (typeArr[i] == "0"){
            this.curSentenceIdx = i;
            var arr = this.sentenceLabelNodeArr[i];
            var labNode = arr[arr.length -1];
            var btn = labNode.getChildByName("question_button");
            btn.active = true;
            return;
        }
    }
    if (i >= typeArr.length){
        this.curSentenceIdx = -1;
        g_ada.curLevel++;
        this.initSentence();
        if (this.curSentenceIdx >= 0){
            var arr = this.sentenceLabelNodeArr[this.curSentenceIdx];
            var labNode = arr[arr.length -1];
            var btn = labNode.getChildByName("question_button");
            btn.active = false;
        }
        var curData = g_ada.levelData[g_ada.curLevel];
        var typeArr = curData.type;
        for (i = this.curSentenceIdx+1; i < typeArr.length; ++i){
            if (typeArr[i] == "0"){
                this.curSentenceIdx = i;
                var arr = this.sentenceLabelNodeArr[i];
                var labNode = arr[arr.length -1];
                var btn = labNode.getChildByName("question_button");
                btn.active = true;
                break;
            }
        }
        this.initDisk();
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
        var lab = this.createLinkWordLabel(wordArr[idxArr[i]]);
        lab.setPosition(posArr[i]);
        this.diskImg.node.addChild(lab);
    }
}

cls.getWordPosArr = function(num){
    const radius = 145;
    var intervalAngle = 360 / num;
    var arr = [];
    for(var i = 0; i < num; ++i){
        var angle = 90 - intervalAngle*i;
        var radian = angle*Math.PI/180;
        var pos = cc.v2(Math.cos(radian)*radius, Math.sin(radian)*radius+6);
        arr.push(pos);
    }
    return arr;
}

cls.createShowWordLabel = function(str){
    var prefab = cc.instantiate(this.wordLabelPrefab);
    var labelNode = prefab.getChildByName("label");
    labelNode.color = new cc.Color(0, 0, 0);
    var labelComponent = labelNode.getComponent(cc.Label);
    labelComponent.string = str;
    if (str == ""){
        var spt = prefab.getComponent(cc.Sprite);
        spt.spriteFrame = new cc.SpriteFrame(wordTex);
    }
    return prefab;
}

cls.createLinkWordLabel = function(str){
    var node = new cc.Node();
    node.setContentSize(50, 50);
    var spt = node.addComponent(cc.Sprite);
    spt.spriteFrame = new cc.SpriteFrame(touchTex);
    spt.enabled = false;
    var childNode = new cc.Node("label");
    childNode.color = new cc.Color(0, 0, 0);
    childNode.setContentSize(55, 55);
    var label = childNode.addComponent(cc.Label);
    label.fontSize = 50
    label.lineHeight = 50
    label.string = str;
    node.addChild(childNode);
    return node;
}

cls.onDestroy = function(){
    eventEmit.off("win");
    eventEmit.off("fail");
}

cls.onTouchStart = function(event){
    this.explainSpt.node.active = false;
    this.touchSptNode = null;
    this.haveTouchWordArr = [];
    var startLocation = event.getLocation();
    console.log("touch start", startLocation.x, startLocation.y);
    var touchNode = this.getTouchLabelNode(startLocation);
    if (touchNode){
        this.touchSptNode = touchNode;
        this.touchEffectShow(touchNode);
        this.haveTouchWordArr.push(touchNode);
        this.createLineNodeAndRefreshShowLabel(touchNode);
    }
}

cls.onTouchMove = function(event){
    if (this.touchSptNode){
        var moveLocation = event.getLocation();
        var lineNode = this.touchSptNode.getChildByName("line");
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
            graph.stroke();
            this.touchSptNode = touchNode;
            this.touchEffectShow(touchNode);
            this.haveTouchWordArr.push(touchNode);
            this.createLineNodeAndRefreshShowLabel(touchNode);
        }else{
            var pos = this.touchSptNode.convertToNodeSpaceAR(moveLocation);
            graph.lineTo(pos.x, pos.y);
            graph.stroke();
            var lastNode = this.haveTouchWordArr[this.haveTouchWordArr.length-2];
            if (lastNode && touchNode){
                if (lastNode.uuid == touchNode.uuid){
                    lastNode.removeChild(lastNode.getChildByName("line"));
                    var node1 = this.haveTouchWordArr[this.haveTouchWordArr.length-1];
                    node1.removeChild(node1.getChildByName("line"));
                    this.touchEffectHide(node1);
                    this.haveTouchWordArr.pop();
                    this.touchSptNode = lastNode;
                    this.touchEffectShow(lastNode);
                    this.createLineNodeAndRefreshShowLabel(lastNode);
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
            var labelNode = nodeLabelArr[i].getChildByName("label");
            var label = labelNode.getComponent(cc.Label);
            label.string = sentence[i];
        }
        this.nextEmptySentence();
        this.refreshDisk();
        this.haveTouchWordArr = [];
        this.showTouchLabelContent();
    }else{
        for(var i = 0; i < this.haveTouchWordArr.length; ++i){
            var node = this.haveTouchWordArr[i];
            this.touchEffectHide(node);
            node.removeChild(node.getChildByName("line"));
        }
        this.haveTouchWordArr = [];
        this.showTouchLabelContent();
    }
}

cls.createLineNodeAndRefreshShowLabel = function(parent){
    var node = new cc.Node("line");
    node.addComponent(cc.Graphics);
    parent.addChild(node);
    this.showTouchLabelContent();
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
        var labelNode = this.haveTouchWordArr[i].getChildByName("label");
        var label = labelNode.getComponent(cc.Label);
        str += label.string;
    }
    this.showLabel.string = str;
    this.showSpt.node.width = this.haveTouchWordArr.length*40+40;
    if (str == "")
        this.showSpt.node.active = false;
    else
        this.showSpt.node.active = true;
}

cls.touchEffectShow = function(node){
    var labelNode = node.getChildByName("label");
    labelNode.color = new cc.Color(255, 255, 255);
    var spt = node.getComponent(cc.Sprite);
    spt.enabled = true;
}

cls.touchEffectHide = function(node){
    var labelNode = node.getChildByName("label");
    labelNode.color = new cc.Color(0, 0, 0);
    var spt = node.getComponent(cc.Sprite);
    spt.enabled = false;
}

var isHaveTouched = function(arr, node){
    for (var i = 0; i < arr.length; ++i){
        if (arr[i].uuid == node.uuid){
            return true;
        }
    }
    return false;
}

cls.onShare = function(){
    console.log(TAG, "onShare");
}

cls.onLevel = function(){
    console.log(TAG, "onShare");
    this.homeNode.active = false;
    this.wordNode.active = true;
}

cls.onBack = function(){
    console.log(TAG, "onClose");
    this.homeNode.active = true;
    this.wordNode.active = false;
    this.initHome();
}

cls.onRank = function(){
    console.log(TAG, "onRank");
}

cls.onQuestion = function(){
    var curData = g_ada.levelData[g_ada.curLevel];
    var explain = curData.explain[this.curSentenceIdx];
    console.log(TAG, "onQuestion ", explain);
    this.explainLabel.string = explain;
    this.explainSpt.node.active = true;
}

cls.onRefresh = function(){
    console.log(TAG, "onRefresh");
    this.refreshDisk();
}

cls.onHint = function(){
    console.log(TAG, "onHint");
}

cc.Class(cls);