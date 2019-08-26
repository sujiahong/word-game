"use strict";
const TAG = "GameUser.js";
const Client = require("../util/net_client");
const request = require("../util/http_request");
const constant = require("../share/constant");
const errcode = require("../share/errcode");

class GameUser {
    constructor(id, coins){
        this.userId = id;
        this.coins = coins;
        this.account = "";
        this.nickname = "";
        this.sex = 0;
        this.iconUrl = "";
        this.connectData = null;
        this.address = "";
        var addressData = cc.sys.localStorage.getItem(constant.LOCAL_ITEM.address_data);
        if (addressData){
            addressData = JSON.parse(addressData);
            this.address = addressData.address;
        }
        var connectData = cc.sys.localStorage.getItem(constant.LOCAL_ITEM.connect_data);
        if (connectData){
            connectData = JSON.parse(connectData);
            this.connectData = connectData;
        }
    }


    buyCoins(num){
        if (this.address == ""){
            return next(errcode.REQUEST_URL_NULL);
        }
        request.get({
            url: "",
            userId: this.userId,
        }, function(code, ret){
            if (code != errcode.OK)
                return next(code);
            if (ret.code != errcode.OK){
                return next(ret.code);
            }
        });
    }
    logout(next){
        if (this.address == ""){
            return next(errcode.REQUEST_URL_NULL);
        }
        request.get({
            url: this.address+"/logout",
            userId: this.userId,
        }, function(code, ret){
            if (code != errcode.OK)
                return next(code);
            if (ret.code != errcode.OK){
                return next(ret.code);
            }
            delete cc.g_ada.gameUser;
            next(0);
        });
    }
    createRoom(next){
        var self = this;
        if (this.address == ""){
            return next(errcode.REQUEST_URL_NULL);
        }
        var roomInfo = {
            userId: this.userId,
        };
        roomInfo = JSON.stringify(roomInfo);
        request.get({
            url: this.address+"/createRoom",
            userId: this.userId,
            roomInfo: encodeURIComponent(roomInfo)
        }, function(code, ret){
            console.log(TAG, "createRoom: ", code, JSON.stringify(ret));
            if (code != errcode.OK)
                return next(code);
            if (ret.code != errcode.OK){
                return next(ret.code);
            }
            cc.sys.localStorage.setItem(constant.LOCAL_ITEM.connect_data, JSON.stringify(ret));
            ret.userId = self.userId;
            doJoinRoom(ret, next);
        });
    }
    joinRoom(roomId, next){
        if (this.address == ""){
            return next(errcode.REQUEST_URL_NULL);
        }
        var self = this;
        request.get({
            url: this.address+"/joinRoom",
            userId: this.userId,
            roomId: roomId,
        }, function(code, ret){
            console.log(TAG, "joinRoom: ", code, JSON.stringify(ret));
            if (code != errcode.OK)
                return next(code);
            if (ret.code != errcode.OK){
                return next(ret.code);
            }
            ret.roomId = roomId;
            cc.sys.localStorage.setItem(constant.LOCAL_ITEM.connect_data, JSON.stringify(ret));
            ret.userId = self.userId
            doJoinRoom(ret, next);
        });
    }

    reconnect(next){
        if (!this.connectData){
            return next(errcode.CONNECTION_DATA_NULL);
        }
        doJoinRoom(this.connectData, next);
    }

    getPlayerInitData(){
        return {
            userId: this.userId,
            nickname: this.nickname,
            sex: this.sex,
            icon: this.iconUrl,
            ip: this.ip,
            coins: this.coins,
        };
    }
};

var doJoinRoom = function(ret, next){
    var cli = new Client({ip: ret.ip, port: ret.port});
    cc.g_ada.cliSocket = cli;
    cli.connect(function(code){
        if (code != errcode.OK){
            return console.log(TAG, "doJoinRoom: ", code);
        }
        cli.request("joinRoom", {userId: ret.userId, roomId: ret.roomId, connectionCode: ret.connectionCode}, function(result){
            if (result.code != errcode.OK){
                return next(result.code);
            }
            next(0);
        });
    });
}

module.exports = GameUser;