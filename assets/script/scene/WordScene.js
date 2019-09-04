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
cc.loader.load(cc.url.raw("resources/UI/主界面/椭圆 4 拷贝 2.png"), function(err, tex){
    if (err == null){
        touchTex = tex;
    }
});
let wordTex = null;
cc.loader.load(cc.url.raw("resources/UI/主界面/矩形 1 拷贝 34.png"), function(err, tex){
    if (err == null){
        wordTex = tex;
    }
});

var cls = {};
cls.extends = cc.Component;
cls.properties = {
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

    curSentenceIdx: -1,
};

cls.onLoad = function(){
    var self =  this;
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
    // var url = cc.url.raw("resources/level.json");
    // console.log(url)
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
    scrollContent.height = 100 * len;
    var nodeSize = 50;
    var wi = 0, hi = (scrollContent.height-nodeSize*len) / (len+1);
    console.log("1111  ", JSON.stringify(scrollContent.getContentSize()))
    for (var i = 0; i < len; ++i){
        var sentence = lineArr[i];
        var slen = sentence.length;
        var y = -((hi+nodeSize/2)*(i+1) + (nodeSize/2)*i);
        var arr = [];
        for (var j = 0; j < slen; ++j){
            wi = (scrollContent.width - nodeSize*slen)/(slen+1);
            var x = -(scrollContent.width/2 - ((wi+nodeSize/2)*(j+1) + (nodeSize/2)*j));
            var labNode = this.createShowWordLabel((curData.type[i] == "1") ? sentence[j]: "");
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
    var curData = g_ada.levelData[g_ada.curLevel];
    var typeArr = curData.type;
    for (var i = this.curSentenceIdx+1; i < typeArr.length; ++i){
        if (typeArr[i] == "0"){
            this.curSentenceIdx = i;
            return;
        }
    }
    if (i >= typeArr.length){
        this.curSentenceIdx = -1;
        g_ada.curLevel++;
        this.initSentence();
        var curData = g_ada.levelData[g_ada.curLevel];
        var typeArr = curData.type;
        for (i = this.curSentenceIdx+1; i < typeArr.length; ++i){
            if (typeArr[i] == "0"){
                this.curSentenceIdx = i;
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
    const radius = 110;
    var intervalAngle = 360 / num;
    var arr = [];
    for(var i = 0; i < num; ++i){
        var angle = 90 - intervalAngle*i;
        var radian = angle*Math.PI/180;
        var pos = cc.v2(Math.cos(radian)*radius, Math.sin(radian)*radius);
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
    node.setContentSize(40, 40);
    var spt = node.addComponent(cc.Sprite);
    spt.spriteFrame = new cc.SpriteFrame(touchTex);
    spt.enabled = false;
    var childNode = new cc.Node("label");
    childNode.color = new cc.Color(0, 0, 0);
    childNode.setContentSize(40, 40);
    var label = childNode.addComponent(cc.Label);
    label.string = str;
    node.addChild(childNode);
    return node;
}

cls.onDestroy = function(){
    eventEmit.off("win");
    eventEmit.off("fail");
}

cls.onTouchStart = function(event){
    this.touchSptNode = null;
    this.haveTouchWordArr = [];
    var startLocation = event.getLocation();
    console.log("touch start", startLocation.x, startLocation.y);
    var touchNode = this.getTouchLabelNode(startLocation);
    if (touchNode){
        this.touchSptNode = touchNode;
        this.touchEffectShow(touchNode);
        this.haveTouchWordArr.push(touchNode);
        var node = new cc.Node("line");
        node.addComponent(cc.Graphics);
        touchNode.addChild(node);
        this.showTouchLabelContent();
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
            this.touchSptNode = touchNode;
            this.touchEffectShow(touchNode);
            this.haveTouchWordArr.push(touchNode);
            var node = new cc.Node("line");
            node.addComponent(cc.Graphics);
            touchNode.addChild(node);
            graph.stroke();
            this.showTouchLabelContent();
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
                    this.haveTouchWordArr.pop();
                    this.touchSptNode = lastNode;
                    this.touchEffectShow(lastNode);
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

cls.onBack = function(){
    console.log(TAG, "onClose");
    cc.director.loadScene("HomeClassScene");
}

cls.onRank = function(){
    console.log(TAG, "onRank");
}

cls.onRefresh = function(){
    console.log(TAG, "onRefresh");
}

cls.onHint = function(){
    console.log(TAG, "onHint");
}

cc.Class(cls);