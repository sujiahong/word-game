module.exports = {
    load() {
        // 当 package 被正确加载的时候执行
    },

    unload() {
        // 当 package 被正确卸载的时候执行
    },

    messages: {
        'showPanel'() {
            Editor.Panel.open('hot-update-tools');
        },
        'test'(event, args) {
            console.log("1111111");
            Editor.log(args);
            Editor.Ipc.sendToPanel('hot-update-tools', 'hot-update-tools:onBuildFinished');
        },
        // 当插件构建完成的时候触发
        'editor:build-finished': function (event, target) {
            let Fs = require("fire-fs");
            let Path = require("fire-path");

            Editor.log("[HotUpdateTools] build platform:" + target.platform);
            if (target.platform === "web-mobile" || target.platform === "web-desktop") {
                Editor.log("[HotUpdateTools] don't need update main.js");
            } else {
                let root = Path.normalize(target.dest);
                let url = Path.join(root, "main.js");
                Fs.readFile(url, "utf8", function (err, data) {
                    if (err) {
                        throw err;
                    }
                    let newStr =
                        "window.boot = function () {\n\n"+
                        "    if (cc && cc.sys.isNative) { \n" +
                        "        var hotUpdateSearchPaths = cc.sys.localStorage.getItem('HotUpdateSearchPaths'); \n" +
                        "        if (hotUpdateSearchPaths) { \n" +
                        "            jsb.fileUtils.setSearchPaths(JSON.parse(hotUpdateSearchPaths)); \n" +
                        "            console.log('[main.js] 热更新SearchPath: ' + JSON.parse(hotUpdateSearchPaths));\n" +
                        "        }else {\n" +
                        "            console.log('[main.js] 未获取到热更新资源路径!');\n" +
                        "        }\n" +
                        "    }else {\n" +
                        "        console.log('[main.js] 不是native平台!');\n" +
                        "    }\n"

                    ;

                    let newData = data.replace("window.boot = function () {", newStr);
                    Fs.writeFile(url, newData, function (error) {
                        if (err) {
                            throw err;
                        }
                        Editor.log("[HotUpdateTools] SearchPath updated in built main.js for hot update");
                    });
                });
            }
            let time = new Date().getTime();
            // 通知panel更新时间
            Editor.Ipc.sendToPanel('hot-update-tools', 'hot-update-tools:onBuildFinished', time);
            // 写入本地
            let CfgUtil = Editor.require('packages://hot-update-tools/core/CfgUtil.js');
            CfgUtil.updateBuildTimeByMain(time);
        }
    },
};