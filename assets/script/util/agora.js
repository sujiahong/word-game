"use strict";
const TAG = "agora.js";

require("../extern/js-agora");
const constant = require("../share/constant");

var exp = module.exports;
exp.chidHandlerMap = {};

exp.init = function(){
    console.log(TAG, "agora init !", agora.getVersion(), constant.AGORA_APP_ID);
    agora.init(constant.AGORA_APP_ID);
    agora.setChannelProfile(0);
    agora.enableAudio();
    agora.on("error", function(err, msg){
        console.log(TAG, err, msg);
    });
    agora.on("init-success", function(){
        console.log(TAG, "agora init success!!");
    });
    agora.on("init-success", function(){
        console.log(TAG, "agora init success!!");
    });
    agora.on("join-channel-success", function(chid, uid, elapsed){
        var handler = exp.chidFuncMap[chid];
        if (handler)
            handler(chid, uid, elapsed);
    });
    agora.on("leave-channel", function(stat){
        console.log(TAG, JSON.stringify(stat));
    });
}

exp.joinChannel = function(id, uid, next){
    agora.joinChannel("", id, uid);
    exp.chidFuncMap[id] = next;
}

exp.leaveChannel = function(id){
    agora.leaveChannel();
    delete exp.chidHandlerMap[id];
}

exp.openMute = function(){
    agora.muteLocalAudioStream(true);
}

exp.closeMute = function(){
    agora.muteLocalAudioStream(false);
}