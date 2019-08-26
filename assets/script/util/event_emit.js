"use strict";
const TAG = "event_emit.js";

var exp = module.exports;

exp.emit = function(name, data){
    if (cc.director){
        return cc.director.emit(name, data);
    }
    cc.log(TAG, "发送 emit：cc.g_ada.persistNode null");
}

exp.on = function(name, next){
    if (cc.director){
        return cc.director.on(name, next);
    }
    cc.log(TAG, "监听 on：cc.g_ada.persistNode null");
}

exp.off = function(name){
    if (cc.director){
        return cc.director.off(name);
    }
    cc.log(TAG, "关闭监听 off: cc.g_ada.persistNode null");
}

exp.once = function(name, next){
    if (cc.director){
        return cc.director.once(name, next);
    }
    cc.log(TAG, "监听 once：cc.g_ada.persistNode null");
}