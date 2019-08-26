"use strict";
const TAG = "HomeScene.js";
if (!cc.g_ada){
    cc.g_ada = {};
}
cc.Class({
    extends: cc.Component,

    properties: {
        idLabel: cc.Label,
        coinLabel: cc.Label,
        logoutButton: cc.Button,
        creatRoomButton: cc.Button,
        joinRoomButton: cc.Button,
        stgmButton: cc.Button,
        setupButton: cc.Button,
        msgButton: cc.Button,
        serviceButton: cc.Button,
        shopButton: cc.Button,
        noticeButton: cc.Button,
    },

    // use this for initialization
    onLoad: function () {
        console.log(TAG, "onLoad onLoad!!!!", cc.g_ada);
        this.logoutButton.node.on("click", this.onLogout, this);
        this.creatRoomButton.node.on("click", this.onCreateRoom, this);
        this.joinRoomButton.node.on("click", this.onJoinRoom, this);
        this.stgmButton.node.on("click", this.onStartGame, this);
        this.setupButton.node.on("click", this.onSetup, this);
        this.msgButton.node.on("click", this.onMsg, this);
        this.serviceButton.node.on("click", this.onService, this);
        this.shopButton.node.on("click", this.onShop, this);
        this.noticeButton.node.on("click", this.onNotice, this);
        // this.idLabel.string = cc.g_ada.gameUser.userId;
        // this.coinLabel.string = cc.g_ada.gameUser.coins;
    },

    onLogout: function(){
        console.log(TAG, "onLogout onLogout!!!");
        cc.g_ada.gameUser.logout(function(code){
            if (code != 0){
                return console.log(TAG, code);
            }
            cc.director.loadScene("LoginScene");
        });
    },

    onCreateRoom: function(){
        console.log(TAG, "onCreateRoom onCreateRoom!!!");
        cc.g_ada.gameUser.createRoom(function(code){
            if (code != 0){
                return console.log(TAG, code);
            }
            //cc.director.loadScene("LoginScene");
        });
    },

    onJoinRoom: function(){
        console.log(TAG, "onJoinRoom onJoinRoom!!!");
        cc.g_ada.gameUser.joinRoom(roomId, function(code){
            if (code != 0){
                return console.log(TAG, code);
            }
            //cc.director.loadScene("LoginScene");
        });
    },

    onStartGame: function(){
        console.log(TAG, "onStartGame onStartGame");
        cc.director.loadScene("ClassificationScene");
    },

    onSetup: function(){
        console.log(TAG, "onSetup onSetup!!!");
    },

    onMsg: function(){
        console.log(TAG, "onMsg onMsg!!!");
    },

    onService: function(){
        console.log(TAG, "onService onService!!!");
    },

    onShop: function(){
        console.log(TAG, "onShop onShop!!!");
    },

    onNotice: function(){
        console.log(TAG, "onNotice onNotice!!!");
    }
});
