/**
    主进程模块
    created by deqwin
    2017/1/27  
*/

const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const http = require('http');
const httpProxy = require('http-proxy');


let APIList = {};
let serverUrl = '';
let server = null;

app.on('ready', () => {

    let proxy = httpProxy.createProxyServer({});

    // 启动代理服务
    server = http.createServer(function(req, res){
        if(req.url!="/favicon.ico"){ // 阻拦二次访问
            console.log('API：', req.url, '有访问');
            // 查找API
            let hasThisAPI = false;
            
            for(let blockName in APIList){
                let apis = APIList[blockName]['apis'],
                    reqUrl = req.url.split('?').shift();
                    console.log('来呀快活啊：', reqUrl);
                if (apis.hasOwnProperty(reqUrl)) {
                    console.log(apis[reqUrl]);
                    if(apis[reqUrl]['debugging'] == true){

                        // 设置Access-Control-Allow-Headers
                        let headersAllow = [];
                        for(let header in req.headers){
                            headersAllow.push(header);
                        }
                        console.log(req.raw); 
                        
                        res.writeHead(200,{
                            "Access-Control-Allow-Credentials": "true",
                            "Content-Type": "application/json; charset=UTF-8",
                            "Access-Control-Allow-Origin": "*",
                            "access-control-allow-methods": "GET, POST, OPTIONS",
                            "Access-Control-Allow-Headers": req.rawHeaders
                        });
                        res.write(JSON.stringify(apis[reqUrl]['res']));
                        res.end();
                    }else{

                        proxy.on('error', function(e, req, res) {

                            // 设置Access-Control-Allow-Headers
                            let headersAllow = [];
                            for(let header in req.headers){
                                headersAllow.push(header);
                            }

                            res.writeHead(200,{
                                "Access-Control-Allow-Credentials": "true",
                                "Content-Type": "application/json; charset=UTF-8",
                                "Access-Control-Allow-Origin": "*",
                                "access-control-allow-methods": "GET, POST, OPTIONS",
                                "Access-Control-Allow-Headers": headersAllow.join(' ')
                            });
                            res.write( '访问目的服务器出错: ' + e );
                            res.end();
                        });

                        proxy.web(req, res, { target: 'http://' + serverUrl });

                    }

                    hasThisAPI = true;
                }
            };

            if(!hasThisAPI){
                proxy.on('error', function(e, req, res) {
                    res.writeHead(200,{
                        "Access-Control-Allow-Credentials": "true",
                        "Content-Type": "application/json; charset=UTF-8",
                        "Access-Control-Allow-Origin": "*",
                        "access-control-allow-methods": "GET, POST, OPTIONS",
                        "Access-Control-Allow-Headers": "Origin, Content-Type, Cookie, Accept, CLIENTID, MERCHANTID, ATMID, MOBILEID, WENKUADMINID"
                    });
                    res.write( '该API未在调试列表中，尝试转发访问出错: ' + e );
                    res.end();
                });

                // console.log('http://' + serverUrl + req.url);

                // 修改请求体host
                req.headers.host = serverUrl;
                proxy.web(req, res, { target: 'http://' + serverUrl });
            }
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

app.on('window-all-closed', () => {
    server.close();
})


// 列表信息更新
ipcMain.on('setNewAPIList', function(event, newAPIList) {
    console.log('列表信息更新');
    APIList = newAPIList;
});

// 全局目的服务器主机地址更新
ipcMain.on('setNewGlobalServer', function(event, newServer){
    serverUrl = newServer;
})