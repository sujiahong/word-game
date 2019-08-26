"use strict";
const TAG = "LoginScene.js";
if (!cc.g_ada){
    cc.g_ada = {};
}
const g_ada = cc.g_ada;
const Login = require("../model/LoginLauncher");
const util = require("../util/util");
const event = require("../util/event_emit");

 
cc.Class({
    extends: cc.Component,

    properties: {
        verLablel: cc.Label,
        loginButton: cc.Button,
        accountEdBox: cc.EditBox,
    },

    // use this for initialization
    onLoad: function () {
        console.log(TAG, "onLoad onLoad ", cc.g_ada, g_ada);
        this.loginButton.node.on("click", this.onLogin, this);
        this.accountEdBox.node.on("editing-did-began", this.onEditDidBegan, this);
        this.accountEdBox.node.on("editing-did-ended", this.onEditDidEnd, this);
        this.accountEdBox.node.on("text-changed", this.onTextChange, this);
        this.accountEdBox.node.on("editing-return", this.onEditReturn, this);
        this.loginLauncher = new Login();
        if (cc.g_ada){
            this.verLablel.string = "V" + cc.g_ada.localVersion || 0;
            cc.g_ada.loginLauncher = this.loginLauncher;
        }
        var node = new cc.Node();
        util.delayRun(node, 5, function(dt){
            console.log(TAG, " 1 later exe", dt)
        })
        event.emit("gogo", {aa: "you are limit"})
    },

    onLogin: function(){
        console.log(TAG, "onLogin onLogin!!!");
        this.loginLauncher.login(function(code){
            if (code == 0){
                cc.director.loadScene("HomeScene");
            }
        });
    },

    onEditDidBegan: function(){
        console.log(TAG, "onEditDidBegan");
    },
    onEditDidEnd: function(){
        console.log(TAG, "onEditDidEnd", this.accountEdBox.string);
        this.loginLauncher.setAccount(this.accountEdBox.string);
    },
    onTextChange: function(){
        console.log(TAG, "onTextChange");
    },
    onEditReturn: function(){
        console.log(TAG, "onEditReturn");
    },
});
