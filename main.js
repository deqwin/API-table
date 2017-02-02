/**
    主进程模块
    created by deqwin
    2017/1/27  
*/

let electron = require('electron');
let { app, BrowserWindow, ipcMain } = electron;
let http = require('http');

app.on('ready', () => {

    // 启动代理服务
    http.createServer((req, res) => {
        if(req.url!="/favicon.ico"){
            
        }
    }).listen(1337);

    // 启动窗口
    win = new BrowserWindow({ 
        height: 700, 
        width: 1056, 
        resizable: false, 
        title: 'API table' });
    win.loadURL('file://'+__dirname+'/app/index.html');


});