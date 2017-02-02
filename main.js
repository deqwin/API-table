/**
    主进程模块
    created by deqwin
    2017/1/27  
*/

const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const http = require('http');
const httpProxy = require('http-proxy');


app.on('ready', () => {

    let APIList = {};
    let proxy = httpProxy.createProxyServer({});

    // 启动代理服务
    http.createServer(function(req, res){
        if(req.url!="/favicon.ico"){ // 阻拦二次访问
            console.log('API：', req.url, '有访问');
            // 查找API
            let hasThisAPI = false;
            for(let blockName in APIList){
                let apis = APIList[blockName]['apis'];
                if (apis.hasOwnProperty(req.url)) {

                    if(apis[req.url]['debugging'] = true){
                        res.writeHead(200,{
                            "Content-Type":"text/plain; charset=utf-8",
                            "Access-Control-Allow-Origin": "*"
                        });
                        res.write(JSON.stringify(apis[req.url]['res']));
                        res.end();
                    }else{
                        proxy.web(req, res, { target: 'http://localhost:1337' })
                    }

                    hasThisAPI = true;
                }
            };

            if(!hasThisAPI){
                res.writeHead(200,{
                    "Content-Type":"text/plain; charset=utf-8",
                    "Access-Control-Allow-Origin": "*"
                });
                res.write('查找不到相关的API');
                res.end();
            }
        }
    }).listen(1337);

    // 列表信息更新
    ipcMain.on('setNewAPIList', function(event, newAPIList) {
        console.log('列表信息更新');
        APIList = newAPIList;
    });

    // 启动窗口
    win = new BrowserWindow({ 
        height: 700, 
        width: 1056, 
        resizable: false, 
        title: 'API table' });
    win.loadURL('file://'+__dirname+'/app/index.html');


});