"use strict";
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var cp = require("child_process");

var manifest = {
    packageUrl: 'http://192.168.10.34:9990/',
    remoteManifestUrl: 'http://192.168.10.34:9990/project.manifest',
    remoteVersionUrl: 'http://192.168.10.34:9990/version.manifest',
    version: '1.00',
    assets: {},
    searchPaths: []
};

var dest = './remote-assets/';
var src = './build/jsb-default/';

// Parse arguments
var i = 2;
while ( i < process.argv.length) {
    var arg = process.argv[i];

    switch (arg) {
    case '--url' :
    case '-u' :
        var url = process.argv[i+1];
        manifest.packageUrl = url;
        manifest.remoteManifestUrl = url + 'project.manifest';
        manifest.remoteVersionUrl = url + 'version.manifest';
        i += 2;
        break;
    case '--version' :
    case '-v' :
        manifest.version = process.argv[i+1];
        i += 2;
        break;
    case '--src' :
    case '-s' :
        src = process.argv[i+1];
        i += 2;
        break;
    case '--dest' :
    case '-d' :
        dest = process.argv[i+1];
        i += 2;
        break;
    default :
        i++;
        break;
    }
}


function readDir (dir, obj) {
    var stat = fs.statSync(dir);
    if (!stat.isDirectory()) {
        return;
    }
    var subpaths = fs.readdirSync(dir), subpath, size, md5, compressed, relative;
    console.log("~~~~~~~   ", subpaths)
    for (var i = 0; i < subpaths.length; ++i) {
        if (subpaths[i][0] === '.') {
            continue;
        }
        subpath = path.join(dir, subpaths[i]);
        stat = fs.statSync(subpath);
        if (stat.isDirectory()) {
            readDir(subpath, obj);
        }else if (stat.isFile()) {
            // Size in Bytes
            size = stat['size'];
            md5 = crypto.createHash('md5').update(fs.readFileSync(subpath, 'binary')).digest('hex');
            compressed = path.extname(subpath).toLowerCase() === '.zip';

            relative = path.relative(src, subpath);
            relative = relative.replace(/\\/g, '/');
            relative = encodeURI(relative);
            obj[relative] = {
                'size' : size,
                'md5' : md5
            };
            if (compressed) {
                obj[relative].compressed = true;
            }
        }
    }
}

var mkdirSync = function (path) {
    try {
        fs.mkdirSync(path);
    } catch(e) {
        if ( e.code != 'EEXIST' ) throw e;
    }
}

// Iterate res and src folder
readDir(path.join(src, 'src'), manifest.assets);
readDir(path.join(src, 'res'), manifest.assets);

var destManifest = path.join(dest, 'project.manifest');
var destVersion = path.join(dest, 'version.manifest');

mkdirSync(dest);

fs.writeFileSync(destManifest, JSON.stringify(manifest));
//fs.writeFileSync(path.join("./assets", "project.manifest"), JSON.stringify(manifest));
console.log('Manifest successfully generated');

delete manifest.assets;
delete manifest.searchPaths;
fs.writeFileSync(destVersion, JSON.stringify(manifest));
console.log('Version successfully generated');

cp.execSync("cp -R ./build/jsb-default/res/ ./remote-assets/res/");
cp.execSync("cp -R ./build/jsb-default/src/ ./remote-assets/src/");
cp.execSync("cd ./remote-assets; tar -cvzf update.tar project.manifest version.manifest res src");
console.log("打包完成！！   准备上传更新包！！！");
cp.execSync("./upload.sh");
console.log("上传更新结束！！！");
cp.execSync("rm -rf ./remote-assets/update.tar");