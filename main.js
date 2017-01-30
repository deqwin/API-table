/**
    主进程模块
    created by deqwin
    2017/1/27  
*/

let electron = require('electron');
let { app, BrowserWindow } = electron;

app.on('ready', () => {
    win = new BrowserWindow({ 
        height: 700, 
        width: 1000, 
        resizable: false, 
        title: 'API table' });
    win.loadURL('file://'+__dirname+'/app/index.html');
});