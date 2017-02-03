/**
 * node程序
 */
const httpProxy = require('http-proxy');

class appServer {
    init(){
        return httpProxy.createProxyServer({})
    }
    web(req, res, obj){
        this.web(req, res, obj)
    }
};

module.exports = appServer;