"use strict";
const TAG = "hot_update.js";
const errcode = require("../share/errcode");

var hot = {};

var compareFunc = function(v1, v2){
    var arr1 = v1.split('.');
    var arr2 = v2.split('.');
    for (var i = 0; i < arr1.length; ++i) {
        var a = parseInt(arr1[i]);
        var b = parseInt(arr2[i] || 0);
        if (a === b) {
            continue;
        }else {
            return a - b;
        }
    }
}

hot.ctor = function(){
    var localManifest = arguments[0].nativeUrl;
    this.localManifest = localManifest;
    var localPath = ((jsb.fileUtils) ? (jsb.fileUtils.getWritablePath()) : "/") + "new-assets";
    console.log(TAG, (localManifest), localPath, cc.sys.isNative);
    this.am = new jsb.AssetsManager(localManifest, localPath, compareFunc);
    this.am.setVerifyCallback(function(filepath, asset){
        console.log(TAG, "setVerifyCallback  ", filepath);
        return true;
        var md5 = calculateFileMD5(filepath);
        if (md5 == asset.md5)
            return true;
        else
            return false;
    });
    this.am.loadLocalManifest(localManifest);
}

var calculateFileMD5 = function(filepath){

}

hot.check = function(next){
    var self = this;
    var state = this.am.getState();
    if (state == jsb.AssetsManager.State.UNINITED){
        this.am.loadLocalManifest(this.localManifest);
    }
    var lmf = this.am.getLocalManifest();
    if (!lmf || !lmf.isLoaded()){
        return next(errcode.LOCAL_MANIFEST_LOAD_ERR);
    }
    this.am.setEventCallback(function(event){
        var cval = event.getEventCode();
        cc.log(TAG, "3333333 hot.check ", cval);
        switch(cval){
        case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
            cc.log(TAG + " No local manifest file found");
            self.am.setEventCallback(null);
            next(errcode.CHECK_UPDATE_ERR);
            break;
        case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
        case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
            cc.log(TAG + " Fail to download manifest file");
            self.am.setEventCallback(null);
            next(errcode.CHECK_UPDATE_ERR);
            break;
        case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
            console.log(TAG, "alrady")
            self.am.setEventCallback(null);
            next(errcode.OK);
            break;
        case jsb.EventAssetsManager.NEW_VERSION_FOUND:
            cc.log(TAG + " New version found, updating...");
            self.am.setEventCallback(null);
            self.update(next);
            break;
        case jsb.EventAssetsManager.UPDATE_PROGRESSION:
            cc.log(TAG, "下载version.manifest 文件！！！");
            break;
        default:
            return;
        }
    });
    this.am.checkUpdate();
}

hot.update = function(next){
    var self = this;
    var state = this.am.getState();
    if (state == jsb.AssetsManager.State.UNINITED){
        this.am.loadLocalManifest(this.localManifest);
    }
    this.am.setEventCallback(function(event){
        var cval = event.getEventCode();
        cc.log(TAG, "44444444 hot.update  ", cval);
        switch(cval){
        case jsb.EventAssetsManager.UPDATE_PROGRESSION:
            var percent = event.getPercent();
            var filePercent = event.getPercentByFile();
            var fileTotal = event.getDownloadedFiles() + ' / ' + event.getTotalFiles();
            var byteTotal = event.getDownloadedBytes() + ' / ' + event.getTotalBytes();
            cc.log(TAG, "jsb.EventAssetsManager.UPDATE_PROGRESSION");
            var data = {
                percent: percent,
                filePercent: filePercent,
                fileTotal: fileTotal,
                byteTotal: byteTotal,
            };
            next(errcode.UPDATEING_ASSETS, data);
            break;
        case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
        case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
            cc.log(TAG + " Fail to download manifest file");
            self.am.setEventCallback(null);
            next(errcode.HOT_UPDATE_ERR);
            break;
        case jsb.EventAssetsManager.ERROR_UPDATING:
            cc.log(TAG, "jsb.EventAssetsManager.ERROR_UPDATING: " , event.getAssetId(),  event.getMessage());
            next(errcode.ASSET_UPDATE_ERR);
            break;
        case jsb.EventAssetsManager.ERROR_DECOMPRESS:
            cc.log(TAG, "jsb.EventAssetsManager.ERROR_DECOMPRESS:", event.getMessage());
            next(errcode.DECOMPRESS_ERR);
            break;
        case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
            self.am.setEventCallback(null);
            next(errcode.OK);
            break;
        case jsb.EventAssetsManager.UPDATE_FINISHED:
            self.am.setEventCallback(null);
            self.gameRestart();
            next(errcode.UPDATEING_FINISHED);
            break;
        case jsb.EventAssetsManager.UPDATE_FAILED:
            cc.log(TAG, "jsb.EventAssetsManager.UPDATE_FAILED: " , event.getMessage());
            self.am.downloadFailedAssets();
            next(errcode.HOT_UPDATE_ERR);
            break;
        default:
            break;
        }
    });
    this.am.update();
}

hot.gameRestart = function(){
    var searchPathArr = jsb.fileUtils.getSearchPaths();
    var newPathArr = this.am.getLocalManifest().getSearchPaths();
    Array.prototype.unshift.apply(searchPathArr, newPathArr);
    cc.sys.localStorage.setItem("HotUpdateSearchPaths", JSON.stringify(searchPathArr));
    jsb.fileUtils.setSearchPaths(searchPathArr);
    cc.audioEngine.stopAll();
    cc.game.restart();
}

hot.getLocalVersion = function(){
    var manifest = this.am.getLocalManifest();
    return manifest.getVersion();
}


module.exports = cc.Class(hot);
