// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html
"use strict";
const TAG = "open data launch.js";

cc.Class({
    extends: cc.Component,

    properties: {
        rankScroll: cc.ScrollView,
        friendPrefab: cc.Prefab,
        backButton: cc.Button,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.backButton.node.on("click", this.onBack, this);
        console.log(TAG, "onload onload")
        var scrollContent = this.rankScroll.content;
        console.log(scrollContent.width, scrollContent.height)
        for(var i = 0; i < 5; ++i){
            var prefab = cc.instantiate(this.friendPrefab);
            
            //prefab.setPosition(cc.v2(0, -500))
            scrollContent.addChild(prefab);
            console.log(prefab.x, prefab.y)
        }
    },

    start () {
        if (typeof wx === "undefined"){
            return;
        }
        wx.onMessage((data)=>{
            console.log(TAG, "2222222", data.message);
        });
        // wx.getOpenDataContext().postMessage({
        //     message: "111111  jdhsfslf;k  1111"
        // });
        var renderTypeStr = "canvas";
        if (cc.game.renderType == cc.game.RENDER_TYPE_WEBGL){
            renderTypeStr = "webGL";
        }
        console.log("@@   ", renderTypeStr)
        wx.getUserInfo({
            openIdList: ["SelfOpenId"],
            lang: "zh_CN",
            success: (res)=>{
                console.log("333  ", res)
            },
            fail: (res)=>{
                console.log("444  ", res)
            }
        });
        wx.getFriendCloudStorage({
            success: function(res){
                console.log("555  ", res)
            },
            fail: (res)=>{
                console.log("666 ", res)
            }
        });
    },
    onBack(){
        console.log("!!! onBack !!")
        //this.node.active = false;
    }
    // update (dt) {},
});
