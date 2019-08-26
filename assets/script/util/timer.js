"use strict";
const TAG = "wo_timer.js";

cc.Class({
    extends: cc.Component,

    properties: {
        dt: 0,
        callback: null,
        running: false,
    },
    init: function(dt, callback){
        this.dt = dt || 0;
        this.callback = callback;
        this.resume();
    },
    onLoad: function(){
        console.log(TAG, "onLoad onLoad on!!!")
    },

    onDestroy: function(){
        console.log(TAG, "onDestroy onDestroy!!")
        this.pause();
    },

    setCallback: function(cb){
        if (typeof cb == "function")
            this.callback = cb;
    },

    resume: function(){
        if (this.callback){
            cc.director.getScheduler().schedule(this.callback, this, this.dt);
        }
        this.running = true;
    },

    pause: function(){
        if (this.callback){
            cc.director.getScheduler().unschedule(this.callback, this);
            this.callback = null;
        }
        this.running = false;
    },

    isRunning: function(){
        return this.running;
    }
});