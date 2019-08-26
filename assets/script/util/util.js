"use strict";
const TAG = "util.js";
const crypto = require("../extern/cryptoJS");
//const Timer = require("./node_modules/timer");
//////////小工具///////////

var exp = module.exports;

exp.md5 = function(str){
    return crypto.MD5(str).toString(crypto.enc.Hex);
}

exp.sha256 = function(str){
    return crypto.SHA256(str).toString(crypto.enc.Hex);
}

exp.AESEncrypt = function(str){
    return crypto.AES.encrypt(str, "sec88887");
}
exp.AESDecrypt = function(str){
    return crypto.AES.decrypt(str, "sec88887");
}

exp.base64Encrypt = function(str){
    var arr = crypto.enc.Utf8.parse(str);
    return crypto.enc.Base64.stringify(arr);
}
exp.base64Decrypt = function(str){
    var arr = crypto.enc.Base64.parse(str);
    return arr.toString(crypto.enc.Utf8);
}

exp.clone = function(obj){
    var clone = {};

    return clone;
}

exp.setLocalStore = function(name, str){
    cc.sys.localStorage.setItem(name, str);
}

exp.getLocalStore = function(name){
    return cc.sys.localStorage.getItem(name);
}

exp.rmvLocalStore = function(name){
    cc.sys.localStorage.removeItem(name);
}

exp.delayRun = function(node, dt, next){
    dt = dt || 0.1;
    if (node && node.runAction && typeof next == "function"){
        node.runAction(cc.sequence(
            cc.delayTime(dt),
            cc.callFunc(function(){
                next(dt);
            })
        ));
    }
}

exp.delayRefresher = function(){

}

exp.resetParent = function(node, parent){
    if (node && parent){
        node.retain()
        node.removeFromParent(false)
        parent.addChild(node)
        node.release()
        return
    }
}

exp.createTimer = function(dt, next){
    var timer = new Timer();
    timer.init(dt, next);
    return timer;
}
/////逐帧更新
exp.frameUpdater = function(n, next){
    var count = 0;
    var timer = exp.createTimer(0, function(dt){
        if(n == 0)
            return timer.pause();
        count++;
        next(count);
        if (count >= n){
            timer.pause();
        }
    });
}