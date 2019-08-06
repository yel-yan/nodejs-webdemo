const fs = require('fs');
var path = require("path");
// add url-route in /controllers:

function addMapping(router, mapping) {
    for (var url in mapping) {
        if (url.startsWith('GET ')) {
            var path = url.substring(4);
            router.get(path, mapping[url]);
            console.log(`register URL mapping: GET ${path}`);
        } else if (url.startsWith('POST ')) {
            var path = url.substring(5);
            router.post(path, mapping[url]);
            console.log(`register URL mapping: POST ${path}`);
        } else if (url.startsWith('PUT ')) {
            var path = url.substring(4);
            router.put(path, mapping[url]);
            console.log(`register URL mapping: PUT ${path}`);
        } else if (url.startsWith('DELETE ')) {
            var path = url.substring(7);
            router.del(path, mapping[url]);
            console.log(`register URL mapping: DELETE ${path}`);
        } else {
            console.log(`invalid URL: ${url}`);
        }
    }
}

function addControllers(router, dir) {
    // fs.readdirSync(__dirname + '/' + dir).filter((f) => {
    //     return f.endsWith('.js');
    // }).forEach((f) => {
    //     console.log(`process controller: ${f}...`);
    //     let mapping = require(__dirname + '/' + dir + '/' + f);
    //     addMapping(router, mapping);
    // });

    getFileOfDirSync(dir).forEach((f) => {
        console.log(`process controller: ${__dirname},${f}...`);
        let mapping = require(__dirname + '/' + dir + '/' + f);
        addMapping(router, mapping);
    });
}
// 循环遍历文件目录所有.JS文件
const getFileOfDirSync = (router, dir) => {
    let files = fs.readdirSync(dir);
    let result, filePath;

    if (files) {
        result = files.filter((file) => {
            filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                getFileOfDirSync(router, filePath);
            } else {
                return filePath.endsWith('.js');
            }
        });
    }
    console.log(`process controller: ${result}...`);
    result.forEach((f) => {
        console.log(`process controller: ${__dirname}\\${f}...`);
        let mapping = require(__dirname + '/' + dir + '/' + f);
        addMapping(router, mapping);
    });
    // deepFlatten()是平铺数组的方法
    return deepFlatten(result);
}

/**
*
* @description 将多层的打印数组降为所有item行单维数组
* @param {Array} arr 数据数组
* @returns 所有item行数据数组
*/
const deepFlatten = (arr) => {
    return [].concat(...arr.map(v => {
        return Array.isArray(v) ? deepFlatten(v) : v
    }));
}

module.exports = function (dir) {
    let
        controllers_dir = dir || 'controllers',
        router = require('koa-router')();
    getFileOfDirSync(router, controllers_dir);
    return router.routes();
};