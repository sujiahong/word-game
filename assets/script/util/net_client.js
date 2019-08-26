"use strict";
const TAG = "net_client.js";
const packet = require("./packet");
const Buffer = require("buffer").Buffer;
const errcode = require("../share/errcode");
const bufferAnalysis = packet.bufferAnalysis;

var cls = {};

var doConnect = function(self, url, next){
    var socket = new WebSocket(url);
    socket.onopen = function(){
        self.socket = socket;
        next ? next(0) : null;
        setTimeout(()=>{
            self.ping();
            self.freqTimeId = setInterval(()=>{
                self.ping();
            }, self.HBInterval*1000);
        }, 1000);
    }
    socket.onmessage = function(event){
        bufferAnalysis(self, new Buffer(event.data));
    }
    socket.onclose = function(){
        console.log("3333333333  onclose 准备重新连接！！！ ");
        self.close();
        next ? next(errcode.SOCKET_CLOSE) : null;
    }
    socket.onerror = function(event){
        console.log("4444444444  onerror ", JSON.stringify(event));
        throw event;
        next ? next() : null;
    }
}

cls.ctor = function(){
    this.socket = null;
    this.addr = arguments[0];
    this.HBInterval = 20;
    this.HBTime = 0;
    this.freqTimeId = null;
    this.closeTimeId = null;
    this.remainderData = Buffer.alloc(0);
    this.reconnectTimes = 3;
    this.reqId = 0;
    this.reqIdHandlerMap = {};
    this.node = new cc.Node();
}


cls.connect = function(next){
    var self = this;
    var url = "ws://" + this.addr.ip + ":" + this.addr.port;
    console.log(TAG, "准备连接服务器：", url, this.node);
    doConnect(self, url, next);
    //////监听socket数据
    self.node.on("socketData", (msg)=>{
        console.log(TAG, "Client socketData", JSON.stringify(msg), self.HBTime);
        if (msg.route == "pong"){
            if (msg.time == self.HBTime){
                 if (self.closeTimeId){
                     clearTimeout(self.closeTimeId);
                     self.closeTimeId = null;
                 }
            }
        }else{
            var reqId = msg.reqId;
             if (reqId){
                 var handlerFunc = self.reqIdHandlerMap[reqId];
                 if (handlerFunc){
                     handlerFunc(msg.data);
                 }else{
                     console.log(TAG, "没有此reqId的处理函数 ", reqId);
                 }
             }else{
                 self.node.emit(msg.route, msg.data);
             }
        }
    });
}

cls.send = function(data){
    if (this.socket){
        data.reqId = this.reqId;
        var pack = packet.pack(data);
        this.socket.send(pack);
    }else{
        console.error(TAG, "client socket is null, 不能发送数据");
    }
}

cls.ping = function(){
    var self = this;
    this.HBTime = Date.now();
    this.send({route: "ping", time: this.HBTime});
    this.closeTimeId = setTimeout(()=>{
        self.closeTimeId = null;
        self.close();
    }, this.HBInterval*1000/2);
}

cls.request = function(route, msg, next){
    var self = this;
    ++self.reqId;
    if (self.reqIdHandlerMap[self.reqId]){
        ++self.reqId;
    }
    let reqId = self.reqId;
    self.reqIdHandlerMap[reqId] = function(data){
        next(data);
        delete self.reqIdHandlerMap[reqId];
    };
    this.send({route: route, data: msg});
    if (self.reqId > 100000000000)
        self.reqId = 1;
}

cls.on = function(event, next){
    this.node.on(event, next);
}

cls.close = function(){
    if (this.socket){
        this.socket.close();
        this.socket = null;
    }
    if (this.freqTimeId){
        clearInterval(this.freqTimeId);
        this.freqTimeId = null;
    }
    if (this.closeTimeId){
        clearTimeout(this.closeTimeId);
        this.closeTimeId = null;
    }
    this.remainderData = Buffer.alloc(0);
}

module.exports = cc.Class(cls);
