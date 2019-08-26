const TAG = "NiuScene.js";
cc.Class({
    extends: cc.Component,
    properties: {
        empty: cc.Node,
        seat: cc.Node
    },
    onLoad: function(){
        console.warn(TAG, "onLoad");
    },
    start: function(){
        console.warn(TAG, "start");
    },
    update: function(dt){

    },
    ///////////按钮回调//////////
    onSeatDownBtn: function(){
        console.log(TAG, "seatdown clicked");
    },
    onReadyBtn: function(){

    },
    onRobBankerBtn: function(){

    },
    onCallMultipleBtn: function(){

    },
    onTransposeBtn: function(){

    },
    onExitRoomBtn: function(){

    }
});