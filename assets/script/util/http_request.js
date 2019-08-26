"use strict";
const TAG = "http_request.js";
const errcode = require("../share/errcode");
var request = {};

request.get = function(opt, next){
    var url = opt.url;
    delete opt["url"];
    url += "?";
    for (var key in opt){
        var val = opt[key];
        url += key + "=" + val + "&";
    }    
    console.log(TAG, "http get 请求： ", url);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        //console.log(TAG, "!!!!!  onreadystatechange", xhr.responseText, xhr.timeout);
        if (xhr.readyState == 4 && (xhr.status >=200 && xhr.status < 400)){
            next ? next(0, JSON.parse(xhr.responseText)) : null;
        } 
    }
    xhr.open("GET", url, true);
    //xhr.timeout = 3000;
    xhr.send();
    xhr.ontimeout = function(){
        console.log(TAG, "@@@@@@ ontimeout");
        next ? next(errcode.HTTP_REQUEST_TIMEOUT) : null;
    }
    xhr.onerror = function(){
        console.log(TAG, "###### xhr error");
        next ? next(errcode.HTTP_REQUEST_ERROR) : null;
    }
}

request.post = function(opt, next){
    var url = opt.url;
    delete opt["url"];
    var param = "";
    for (var key in opt){
        param += key + "=" + opt[key] + "&";
    }    
    console.log(TAG, "http post 请求： ", url);
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        //console.log(TAG, "!!!!!  onreadystatechange", xhr.responseText, xhr.timeout);
        if (xhr.readyState == 4 && (xhr.status >=200 && xhr.status < 400)){
            next ? next(0, JSON.parse(xhr.responseText)) : null;
        } 
    }
    xhr.open("POST", url, true);
    //xhr.timeout = 3000;
    xhr.setRequestHeader("Content-Type" , "application/x-www-form-urlencoded");  
    xhr.send(param);
    xhr.ontimeout = function(){
        console.log(TAG, "@@@@@@ ontimeout");
        next ? next(errcode.HTTP_REQUEST_TIMEOUT) : null;
    }
    xhr.onerror = function(){
        console.log(TAG, "###### xhr error");
        next ? next(errcode.HTTP_REQUEST_ERROR) : null;
    }}

module.exports = request;
