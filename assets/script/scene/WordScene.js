"use strict";
const TAG = "WordScene.js";
const util = require("../util/util");
const uiHelper = require("../util/ui_helper");
if (!cc.g_ada){
    cc.g_ada = {};
}
const g_ada = cc.g_ada;
util.rmvLocalStore("CUR_POWER");
// util.rmvLocalStore("TIME_CIRCLE");
// util.rmvLocalStore("CUR_LEVEL");
g_ada.curLevel = Number(util.getLocalStore("CUR_LEVEL") || 1);
var curpower = util.getLocalStore("CUR_POWER");
if (curpower){
    g_ada.curPower = Number(curpower);
}else{
    if (curpower !== 0)
        g_ada.curPower = 5000;
    else
        g_ada.curPower = Number(curpower);
}
var curtime = util.getLocalStore("TIME_CIRCLE");
if (curtime){
    g_ada.timeCircle = Number(curtime);
}else{
    g_ada.timeCircle = 900;
}

let wordTex = null;
cc.loader.loadRes("UI/main/word", function(err, tex){
    if (err == null){
        wordTex = tex;
    }
});
let lineTex = null;
cc.loader.loadRes("UI/main/words4", function(err, tex){
    if (err == null){
        lineTex = tex;
    }
});

cc.loader.downloader.loadSubpackage("resources", function(err){
    console.log(err, "分包加载1111！！");
});

var cls = {};
cls.extends = cc.Component;
cls.properties = {
    homeNode: cc.Node,
    powerNode: cc.Node,
    powerLabel: cc.Label,
    timeLabel: cc.Label,
    shareButton: cc.Button,
    logoImg: cc.Sprite,
    levelButton: cc.Button,
    levelBtnLabel: cc.Label,
    homeRankButton: cc.Button,
    userAvatar: cc.Sprite,
    userNameLabel: cc.Label,

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
    linkLabelPrefab: cc.Prefab,
    explainSpt: cc.Sprite,
    explainLabel: cc.Label,

    rankPanel: cc.Node,
    rankCloseButton: cc.Button,

    curSentenceIdx: -1,
    updateTime: 0,
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
    this.rankCloseButton.node.on("click", this.onRankClose, this);
    this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.sentenceScroll.node.on("scroll-began", function(){
        console.log("scroll began ");
    });
    this.initHome();
    cc.loader.loadRes("config/level", function(err, data){
        if (err == null){
            g_ada.levelData = data.json;
            self.initSentence();
            self.nextEmptySentence();
            self.initDisk();
        }
    });
    this.initWX();
}

cls.initWX = function(){
    if (typeof wx === "undefined")
        return
    console.log("11111  1111   ", wx)
    wx.onMessage((data)=>{
        console.log(TAG, "2222222", data.message);
    });
    const info = wx.getSystemInfoSync()
    // wx.getUserInfo({
    //     success: function(res){
    //         console.log("2222 ", res)
    //     }
    // })
    var self = this;
    var button = wx.createUserInfoButton({
        type: "text",
        text: "获取用户信息",
        style: {
            left: 0,
            top: 176,
            width: 150,
            height: 40,
            lineHeight: 40,
            backgroundColor: "#ff0000",
            color: "#ffffff",
            textAlign: "center",
            fontSize: 16,
            borderRadius: 4
        }
    });
    button.onTap((res)=>{
        console.log("222   ", res)
        var userInfo = res.userInfo;
        this.userNameLabel.string = userInfo.nickName;
        cc.loader.load({url: userInfo.avatarUrl, type: "png"}, function(err, tex){
            if (err){
                return console.log(err);
            }
            var spt = self.userAvatar.getComponent(cc.Sprite);
            spt.spriteFrame = new cc.SpriteFrame(tex);
        });

        wx.getOpenDataContext().postMessage({
            message: "111111  user info get info  1111"
        });
    });
}

cls.initHome = function(){
    console.log("##### ", g_ada.curPower, g_ada.timeCircle, g_ada.curLevel)
    this.powerLabel.string = g_ada.curPower;
    this.timeLabel.string = getLocalTime(g_ada.timeCircle);
    this.levelBtnLabel.string = "第 " + g_ada.curLevel + " 关";
    this.updateTime = 0;
}

var getLocalTime = function(time){
    var m = Math.floor(time / 60);
    var s = time % 60;
    return String(m) + ":" + String(s);
}

cls.refreshTime = function(){
    if (g_ada.curPower < 5){
        g_ada.timeCircle--;
        if (g_ada.timeCircle === 0){
            g_ada.curPower++;
            this.powerLabel.string = g_ada.curPower;
            g_ada.timeCircle = 240
        }
        util.setLocalStore("TIME_CIRCLE", g_ada.timeCircle);
        this.timeLabel.string = getLocalTime(g_ada.timeCircle);
    }
}

cls.update = function(dt){
    this.updateTime += dt;
    if (this.updateTime >= 1){
        this.refreshTime();
        this.updateTime = 0;
    }
}

cls.initSentence = function(){
    this.curSentenceIdx = -1;
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
    console.log("2222   ", this.curSentenceIdx)
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
        util.setLocalStore("CUR_LEVEL", g_ada.curLevel);
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
    this.linkNodeArr = [];
    var curData = g_ada.levelData[g_ada.curLevel];
    var wordArr = curData.line[this.curSentenceIdx];
    var wordLen = wordArr.length;
    var posArr = this.getWordPosArr(wordLen);
    var idxArr = getRandomIndexArr(wordLen);
    for (var i = 0; i < wordLen; ++i){
        var lab = this.createLinkWordLabel(wordArr[idxArr[i]]);
        lab.setPosition(posArr[i]);
        lab.name = "node-" + String(i);
        this.diskImg.node.addChild(lab);
        this.linkNodeArr.push(lab);
    }
}

cls.playWordAnim = function(){
    var backAnim = this.backButton.node.getComponent(cc.Animation);
    backAnim.play("back");
    var rankAnim = this.rankButton.node.getComponent(cc.Animation);
    rankAnim.play("rank");
    var refreshAnim = this.refreshButton.node.getComponent(cc.Animation);
    refreshAnim.play("refresh");
    var hintAnim = this.hintButton.node.getComponent(cc.Animation);
    hintAnim.play("hint");
    var diskAnim = this.diskImg.node.getComponent(cc.Animation);
    diskAnim.play("disk");
}

cls.playBackWordAnim = function(next){
    var backAnim = this.backButton.node.getComponent(cc.Animation);
    backAnim.play("back_rt");
    var rankAnim = this.rankButton.node.getComponent(cc.Animation);
    rankAnim.play("rank_rt");
    var refreshAnim = this.refreshButton.node.getComponent(cc.Animation);
    refreshAnim.play("refresh_rt");
    var hintAnim = this.hintButton.node.getComponent(cc.Animation);
    hintAnim.play("hint_rt");
    var diskAnim = this.diskImg.node.getComponent(cc.Animation);
    diskAnim.play("disk_rt");
    var finished = function(){
        next();
        diskAnim.off("finished", finished);
    }
    diskAnim.on("finished", finished);
}

cls.playHomeAnim = function(){
    var levelAnim = this.levelButton.node.getComponent(cc.Animation);
    levelAnim.play("level");
    var homeRankAnim = this.homeRankButton.node.getComponent(cc.Animation);
    homeRankAnim.play("home_rank");
    var powerAnim = this.powerNode.getComponent(cc.Animation);
    powerAnim.play("power");
    var logoAnim = this.logoImg.node.getComponent(cc.Animation);
    logoAnim.play("logo");
}

cls.playShowExplainAnim = function(next){
    var showAnim = this.explainSpt.node.getComponent(cc.Animation);
    var finished = function(){
        next ? next() : null;
        showAnim.off("finished", finished);
    }
    showAnim.play("explain");
    showAnim.on("finished", finished);
}

cls.playHideExplainAnim = function(next){
    var hideAnim = this.explainSpt.node.getComponent(cc.Animation);
    var finished = function(){
        next ? next() : null;
        hideAnim.off("finished", finished);
    }
    hideAnim.play("explain_rt");
    hideAnim.on("finished", finished);
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
    var prefab = cc.instantiate(this.linkLabelPrefab);
    var childNode = prefab.getChildByName("label");
    var label = childNode.getComponent(cc.Label);
    label.string = str;
    return prefab;
}

cls.onDestroy = function(){
    eventEmit.off("win");
    eventEmit.off("fail");
}

cls.onTouchStart = function(event){
    if (this.explainSpt.node.active){
        var self = this;
        this.playHideExplainAnim(function(){
            self.explainSpt.node.active = false;
        });
    }
    this.touchSptNode = null;
    this.haveTouchWordArr = [];
    var startLocation = event.getLocation();
    var touchNode = this.getTouchLabelNode(startLocation);
    console.log("touch start", startLocation.x, startLocation.y);
    if (touchNode){
        this.touchSptNode = touchNode;
        this.touchEffectShow(touchNode);
        this.haveTouchWordArr.push(touchNode);
        this.createLineNode(touchNode);
        this.showTouchLabelContent();
    }
}

cls.onTouchMove = function(event){
    if (this.touchSptNode){
        var moveLocation = event.getLocation();
        var diskNode = this.diskImg.node;
        var lineNode = diskNode.getChildByName("line-"+this.touchSptNode.uuid);
        var srcPos = diskNode.convertToWorldSpaceAR(lineNode.getPosition());
        var touchNode = this.getTouchLabelNode(moveLocation);
        if (touchNode && !isHaveTouched(this.haveTouchWordArr, touchNode)){
            var trgPos = diskNode.convertToWorldSpaceAR(touchNode.getPosition());
            lineNode.width = this.getLineNodeLength(srcPos, trgPos);
            lineNode.angle = this.getLineNodeRotation(srcPos, trgPos);
            this.touchSptNode = touchNode;
            this.touchEffectShow(touchNode);
            this.haveTouchWordArr.push(touchNode);
            this.createLineNode(touchNode);
            this.showTouchLabelContent();
        }else{
            lineNode.width = this.getLineNodeLength(srcPos, moveLocation);
            lineNode.angle = this.getLineNodeRotation(srcPos, moveLocation);
            var lastNode = this.haveTouchWordArr[this.haveTouchWordArr.length-2];
            if (lastNode && touchNode){
                if (lastNode.uuid == touchNode.uuid){
                    diskNode.removeChild(diskNode.getChildByName("line-"+lastNode.uuid));
                    var node1 = this.haveTouchWordArr[this.haveTouchWordArr.length-1];
                    diskNode.removeChild(diskNode.getChildByName("line-"+node1.uuid));
                    this.touchEffectHide(node1);
                    this.haveTouchWordArr.pop();
                    this.touchSptNode = lastNode;
                    this.touchEffectShow(lastNode);
                    this.createLineNode(lastNode);
                    this.showTouchLabelContent();
                }
            }
        }
    }
}

cls.onTouchEnd = function(event){
    var self = this
    var curData = g_ada.levelData[g_ada.curLevel];
    var sentence = curData.line[this.curSentenceIdx];
    if (this.showLabel.string == sentence){//////正确
        this.wordMoveAction(sentence, function(){
            self.nextEmptySentence();
            self.refreshDisk();
        });
        this.haveTouchWordArr = [];
        this.showTouchLabelContent();
    }else{
        for(var i = 0; i < this.haveTouchWordArr.length; ++i){
            var node = this.haveTouchWordArr[i];
            this.touchEffectHide(node);
            this.diskImg.node.removeChild(this.diskImg.node.getChildByName("line-"+node.uuid));
        }
        this.haveTouchWordArr = [];
        this.showTouchLabelContent();
        uiHelper.playShakeAction(this.showSpt.node);
    }
}

cls.wordMoveAction = function(sentence, next){
    var posArr = []
    var nodeLabelArr = this.sentenceLabelNodeArr[this.curSentenceIdx];
    for(var i = 0; i < nodeLabelArr.length; ++i){
        var pos = this.sentenceScroll.content.convertToWorldSpaceAR(nodeLabelArr[i].getPosition())
        console.log("!!!!!     ", JSON.stringify(pos))
        posArr.push(pos);
    }
    var showPos = this.showSpt.node.convertToWorldSpaceAR(this.showLabel.node.getPosition())
    console.log("@@@   ", JSON.stringify(showPos))
    for (var i = 0; i < posArr.length; ++i){
        var node = createLabel(sentence[i]);
        this.node.addChild(node);
        node.setPosition(this.node.convertToNodeSpaceAR(showPos));
        uiHelper.playMoveAction(node, this.node.convertToNodeSpaceAR(posArr[i]));
    }
    util.delayRun(this.node, 1, function(){
        for(var i = 0; i < nodeLabelArr.length; ++i){
            var labelNode = nodeLabelArr[i].getChildByName("label");
            var label = labelNode.getComponent(cc.Label);
            label.string = sentence[i];
        }
        next();
    });
}

var createLabel = function(str){
    var node = new cc.Node()
    node.color = new cc.Color(0, 0, 0);
    var label = node.addComponent(cc.Label)
    label.string = str;
    return node;
}

cls.createLineNode = function(touchNode){
    var node = new cc.Node("line-"+touchNode.uuid);
    node.setAnchorPoint(0, 0.5);
    var spt = node.addComponent(cc.Sprite);
    spt.spriteFrame = new cc.SpriteFrame(lineTex);
    this.diskImg.node.addChild(node)
    node.width = 1;
    node.setPosition(touchNode.getPosition());
}

cls.getLineNodeLength = function(srcPos, trgPos){
    var dx = trgPos.x - srcPos.x;
    var dy = trgPos.y - srcPos.y;
    return Math.sqrt(dx*dx + dy*dy);
}

cls.getLineNodeRotation = function(srcPos, trgPos){
    var dx = trgPos.x - srcPos.x;
    var dy = trgPos.y - srcPos.y;
    var angle = Math.atan2(dx, dy)*180/Math.PI;
    return 90 - angle;
}

cls.getTouchLabelNode = function(location){
    var arr = this.linkNodeArr;
    for (var i = 0; i < arr.length; ++i){
        var rect = arr[i].getBoundingBoxToWorld();
        if (rect.contains(location)){
            return arr[i];
        }
    }
    return null;
}

cls.showTouchLabelContent = function(){
    var self = this;
    var str = "";
    for (var i = 0; i < this.haveTouchWordArr.length; ++i){
        var labelNode = this.haveTouchWordArr[i].getChildByName("label");
        var label = labelNode.getComponent(cc.Label);
        str += label.string;
    }
    if (str == ""){
        util.delayRun(this.showSpt.node, 0.5, function(){
            self.showSpt.node.width = self.haveTouchWordArr.length*40+40;
            self.showLabel.string = str;
            self.showSpt.node.active = false;
        });
    }else{
        this.showLabel.string = str;
        this.showSpt.node.width = this.haveTouchWordArr.length*40+40;
        this.showSpt.node.active = true;
    }
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
    console.log(TAG, "onLevel");
    if (g_ada.curPower > 0){
        this.homeNode.active = false;
        this.wordNode.active = true;
        g_ada.curPower--;
        util.setLocalStore("CUR_POWER", g_ada.curPower);
        this.playWordAnim();
    }
}

cls.onBack = function(){
    console.log(TAG, "onBack");
    var self = this;
    this.playBackWordAnim(function(){
        self.homeNode.active = true;
        self.wordNode.active = false;
        self.playHomeAnim();
        self.initHome();
    });
}

cls.onRank = function(){
    console.log(TAG, "onRank");
    this.rankPanel.active = true;
}

cls.onQuestion = function(){
    var curData = g_ada.levelData[g_ada.curLevel];
    var explain = curData.explain[this.curSentenceIdx];
    console.log(TAG, "onQuestion ", explain);
    this.explainLabel.string = explain;
    this.explainSpt.node.active = true;
    this.playShowExplainAnim();
}

cls.onRefresh = function(){
    console.log(TAG, "onRefresh");
    this.changePosDisk();
}

cls.changePosDisk = function(){
    var diskNode = this.diskImg.node;
    var curData = g_ada.levelData[g_ada.curLevel];
    var wordArr = curData.line[this.curSentenceIdx];
    var wordLen = wordArr.length;
    var arr = getExchangeIdxArr(wordLen);
    for (var i = 0; i < arr.length; ++i){
        var inArr = arr[i];
        if (inArr.length > 1){
            var lab1 = diskNode.getChildByName("node-"+String(inArr[0]));
            var lab2 = diskNode.getChildByName("node-"+String(inArr[1]));
            uiHelper.playExchangePosAction(lab1, lab2);
        }
    }
}

var getExchangeIdxArr = function(len){
    var arr = [];
    var initArr = [];
    for (var i = 0; i < len; ++i){
        initArr.push(i);
    }
    for (var i = 0; i < len; ++i){
        var tempArr = [];
        for (var j = 0; j < 2; ++j){
            if (initArr.length > 0){
                var ran = Math.floor(Math.random()*1000%initArr.length);
                tempArr.push(initArr[ran]);
                initArr.splice(ran, 1);
            }else{
                return arr;
            }
        }
        arr.push(tempArr);
    }
}

cls.onHint = function(){
    console.log(TAG, "onHint");
}

cls.onRankClose = function(){
    this.rankPanel.active = false;
}

cc.Class(cls);