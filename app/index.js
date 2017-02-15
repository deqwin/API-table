/**
 * 渲染进程模块
 * created by deqwin
 * 2017/1/27
 */
import angular from 'angular'; 
import electron from 'electron';
import jsonFormat from 'json-format';
const { ipcRenderer } = electron;

const app = angular.module("apiTable", []);



// 根控制器
app.controller("mainController", $scope => {
    
    $scope.mentionTitle = '';
    $scope.mentionContent = '';
    $scope.showMention = false;

    $scope.$on('sendSelectedAPI', (event, selectAPI) => {
        $scope.$broadcast("receiveSelectedAPI", selectAPI);
    });

    $scope.$on('sendSelectedMode', (event, selectAPI) => {
        $scope.$broadcast('receiveSelectedMode', selectAPI);
    });

    $scope.$on('sendSet', (event, type, selectAPI, content) => {
        console.log('here-2');
        $scope.$broadcast('receiveSet', type, selectAPI, content);
    });

    $scope.$on('sendSelectedServer', (event, selectAPI) => {
        $scope.$broadcast("receiveSelectedServer", selectAPI);
    });

    $scope.$on('sendSelectedGlobalMode', (event, mode) => {
        $scope.$broadcast("receiveSelectedGlobalMode", mode);
    });

    $scope.$on('sendSelectedTestMode', (event, mode) => {
        $scope.$broadcast("receiveSelectedTestMode", mode);
    })

});

app.service('Mention', ($rootScope, $timeout) => {
    return {
        popMention: infoObj => {
            console.log(infoObj);
            $rootScope.mentionTitle = infoObj.title;
            $rootScope.mentionContent = infoObj.content;
            $rootScope.showMention = true;
            $timeout(() => {
                $rootScope.showMention = false;
            }, 2000);
        }
    }
})

// 列表模块控制器
app.controller("listController", $scope => {

    // initialState
    $scope.testNum = 0;
    $scope.APIList = {}; // 包含修改信息的API列表
    $scope.APISourceList = {}; // 原始API列表
    $scope.selectedAPI = '';
    $scope.activeTab = 'all'; // 当前标签页
    $scope.hasReadAPIFile = false; // 是否读取到API文档
    $scope.error = false; // 是否发生导入错误
    $scope.mode = 'mock'; // 当前模式
    $scope.server = ''; // 目的服务器地址
    $scope.showCreatePad = false;
    $scope.createdAPI = {
        debugging: true,
        testMode: 'frontEnd',
        sendFormat: 'query',
        receiveFormat: 'webview',
        server: '',
        name: '',
        method: 'GET',
        req: {},
        res: {}
    }


    // 获取到API文档路径
    $scope.doneGetPath = path => {

        let apiSource = window.dynamicRequire(path);
        let testNum = 0;

        // 尝试解析文档
        try{
            let APIList = {};
            for (var folderName in apiSource) {
                if (apiSource.hasOwnProperty(folderName)) {
                    var folderObj = apiSource[folderName];
                    APIList[folderName] = {
                        showDetail: true,
                        apis: {}
                    };
                    for (var apiName in folderObj) {
                        if (folderObj.hasOwnProperty(apiName)) {
                            let apiObject = folderObj[apiName];
                            let addObject = {
                                debugging: true,
                                testMode: 'frontEnd',
                                sendFormat: 'query',
                                receiveFormat: 'webview',
                                server: '',
                                name: apiName
                            }; 
                            if(folderObj[apiName].method == undefined){
                                throw('非标准API');
                                return;
                            }
                            if( folderObj[apiName].req == undefined)
                                addObject.req = {};
                            APIList[folderName]['apis'][apiName] = Object.assign({},apiObject,addObject);
                            testNum ++;
                        }
                    }
                }
            }
            $scope.APISourceList = JSON.parse(JSON.stringify(APIList));
            $scope.APIList = APIList;
            $scope.testNum = testNum;
        }catch(error){
            console.error(error);
            apiSource = null;
        };


        // 将获取到的API集合发送给主进程
        ipcRenderer.send('setNewAPIList', $scope.APIList);


        // 页面改变
        if(apiSource){
            $scope.hasReadAPIFile = true;
            $scope.error = false;
            // 刺激页面改变
            $scope.$apply();
        }else{
            $scope.hasReadAPIFile = false;
            $scope.error = true;
            // 刺激页面改变
            return $scope.$apply();
        }

    };

    // 选择API
    $scope.selectAPI = ( block, api ) => {
        $scope.$emit('sendSelectedAPI', $scope.APIList[block]['apis'][api]);
        $scope.selectedAPI = api;
    };

    // 标签页切换
    $scope.toggleTab = tab => {
        $scope.activeTab = tab;
    };

    // 创建面板
    // 切换请求方式
    $scope.showPad = () => {
        $scope.showCreatePad = true;
    };
    $scope.hidePad = () => {
        $scope.showCreatePad = false;
    };
    $scope.toggleMthod = method => {
        $scope.createdAPI.method = method;
    };
    $scope.createAPI = () => {

        if(!$scope.createdAPI.name) return;

        if($scope.APIList.hasOwnProperty('新建API')){
            $scope.APIList['新建API']['apis'][$scope.createdAPI.name] = Object.assign({}, $scope.createdAPI);
        }else{
            $scope.APIList = Object.assign($scope.APIList, {
                '新建API': {
                    showDetail: true,
                    apis: {}
                }
            });
            $scope.APIList['新建API']['apis'][$scope.createdAPI.name] = Object.assign({}, $scope.createdAPI);
            $scope.hasReadAPIFile = true;
        }

        $scope.showCreatePad = false;
        console.log('创建后的API列表', $scope.APIList);

        // 将获取到的API集合发送给主进程
        ipcRenderer.send('setNewAPIList', $scope.APIList);

        // 重置数据
        $scope.createdAPI = {
            debugging: true,
            testMode: 'frontEnd',
            sendFormat: 'query',
            receiveFormat: 'webview',
            server: '',
            name: '',
            method: 'GET',
            req: {},
            res: {}
        }
    };


    // api块显隐切换
    $scope.blockToggleDisplay = key => {
       $scope.APIList[key]['showDetail'] = !$scope.APIList[key]['showDetail'];
    };

    // 切换响应模式
    $scope.modeToggle = mode => {
        let testNum = 0;
        $scope.mode = mode;
        $scope.$emit('sendSelectedGlobalMode', mode);

        for (var folderName in $scope.APIList) {
            if ($scope.APIList.hasOwnProperty(folderName)) {
                var apis = $scope.APIList[folderName]['apis'];
                for (var apiName in apis) {
                    if (apis.hasOwnProperty(apiName)) {
                        $scope.APIList[folderName]['apis'][apiName]['debugging'] = mode=='mock'? true:false;
                        testNum = mode=='mock'? ++testNum:testNum;
                    }
                }
            }
        }
        $scope.testNum = testNum;

        // 与主进程同步API列表数据
        ipcRenderer.send('setNewAPIList', $scope.APIList);
    };

    // 设置全局目的服务器地址
    $scope.setGlobalServer = () => {
        // 与主进程同步API列表数据
        console.log($scope.server);
        ipcRenderer.send('setNewGlobalServer', $scope.server);
    };

    $scope.$on('receiveSelectedMode', (event, selectAPI) => {

        for(let blockName in $scope.APIList){
            let apis = $scope.APIList[blockName]['apis'];
            if (apis.hasOwnProperty(selectAPI.name)) {
                $scope.APIList[blockName]['apis'][selectAPI.name]['debugging'] = !$scope.APIList[blockName]['apis'][selectAPI.name]['debugging'];
                if($scope.APIList[blockName]['apis'][selectAPI.name]['debugging']){
                    $scope.testNum ++;
                }else{
                    $scope.testNum --;
                }
            }
        };

        // 与主进程同步API列表数据
        ipcRenderer.send('setNewAPIList', $scope.APIList);
    });
    // 设置请求体/响应体
    $scope.$on('receiveSet', (event, type, selectAPI, content) => {

        console.log('here-3');

        for(let blockName in $scope.APIList){
            let apis = $scope.APIList[blockName]['apis'];
            if (apis.hasOwnProperty(selectAPI.name)) {
                if(content){ //设置
                    console.log(content);
                    $scope.APIList[blockName]['apis'][selectAPI.name][type] = JSON.parse(content);
                }else{ // 重置
                    $scope.APIList[blockName]['apis'][selectAPI.name][type] = $scope.APISourceList[blockName]['apis'][selectAPI.name][type];
                    $scope.$emit('sendSelectedAPI', $scope.APIList[blockName]['apis'][selectAPI.name]);
                }
            }
        };

        // 与主进程同步API列表数据
        ipcRenderer.send('setNewAPIList', $scope.APIList);
    });
    // 设置调试模式
    $scope.$on('receiveSelectedTestMode', (event, mode) => {
        for (var folderName in $scope.APIList) {
            if ($scope.APIList.hasOwnProperty(folderName)) {
                var apis = $scope.APIList[folderName]['apis'];
                for (var apiName in apis) {
                    if (apis.hasOwnProperty(apiName)) {
                        $scope.APIList[folderName]['apis'][apiName]['testMode'] = mode;
                    }
                }
            }
        };

        // 与主进程同步API列表数据
        ipcRenderer.send('setNewAPIList', $scope.APIList);
    });
    // 设置目的服务器地址
    $scope.$on('receiveSelectedServer', (event, selectAPI) => {

        console.log('here is');

        for (var folderName in $scope.APIList) {
            if ($scope.APIList.hasOwnProperty(folderName)) {
                var apis = $scope.APIList[folderName]['apis'];
                for (var apiName in apis) {
                    if (apis.hasOwnProperty(apiName) && (!apis[apiName]['server'] || apiName==selectAPI.name)) {
                        $scope.APIList[folderName]['apis'][apiName]['server'] = selectAPI.server;
                    }
                }
            }
        };

        // 与主进程同步API列表数据
        ipcRenderer.send('setNewAPIList', $scope.APIList);

    })
});

// API细节模块控制器
app.controller("controlPadController", ($scope, $http, Mention) => {

    // initialState
    $scope.selectAPI = null;


    // 切换API调试模式
    $scope.toggleTest = () => {
        $scope.$emit('sendSelectedMode', $scope.selectAPI);
        console.log($scope.selectAPI, 'and', $scope.selectAPI.debugging);
    };
    // 设置API目的服务器地址
    $scope.setAPIServer = () => {
        console.log($scope.selectAPI);
        $scope.$emit('sendSelectedServer', $scope.selectAPI);
    };
    // 切换调试环境
    $scope.testModeToggle = testMode => {
        $scope.$emit('sendSelectedTestMode', testMode);
    };
    // 选择请求格式
    $scope.selectRequestFormat = format => {
        $scope.selectAPI.sendFormat = format;
    };
    // 选择响应格式
    $scope.selectAnswerFormat = format => {
        $scope.selectAPI.receiveFormat = format;
        if($scope.selectAPI.receiveFormat == 'webview'){
            $scope.res = jsonFormat($scope.selectAPI.res, {type: 'space', spaces: 2});
        }else{
            $scope.res = JSON.stringify($scope.selectAPI.res)
        }
    };
    // 重置请求体
    $scope.resetReq = () => {
        $scope.$emit('sendSet', 'req', $scope.selectAPI);
    }
    // 重置响应体
    $scope.resetRes = () => {
        $scope.$emit('sendSet', 'res', $scope.selectAPI);
    }
    // 发送请求
    $scope.sendReq = () => {

        let ajaxData = {
            url: 'http://'+ $scope.selectAPI.server + $scope.selectAPI.name,
            method: $scope.selectAPI.method,
        };

        // 发送格式转化
        let dataContent = {};
        if($scope.selectAPI.sendFormat=='query'){
            // query
            dataContent = $scope.selectAPI.req;
        }else if($scope.selectAPI.sendFormat=='bodyJson'){
            // json
            dataContent = JSON.stringify($scope.selectAPI.req);
        }else{
            // formData
            dataContent = new FormData();
            let req = $scope.selectAPI.req;
            for(let key in req){
                if(req.hasOwnProperty(key)){
                    dataContent.append(key, req[key]);
                }
            }
        }
        // 添加请求实体
        ajaxData = Object.assign(ajaxData, $scope.selectAPI.method=='GET'? {
            params: dataContent
        }:{
            data: dataContent
        });

        $http(ajaxData).then(res => {
            if(typeof res == 'object'){
                if($scope.selectAPI.receiveFormat == 'webview'){
                    $scope.res = jsonFormat(res, {type: 'space', spaces: 2});
                }else{
                    $scope.res = JSON.stringify(res)
                }          
            }else{
                $scope.res = res.data
            }
        }, error => {
            Mention.popMention({title: '访问服务器出错', content: '请检查服务器状态和主机地址是否正确'});
        });
    }
    // 实现ctrl+S保存修改
    $scope.toSetNewAnswer = event => {
        if (event.keyCode == 83 && event.ctrlKey){
            Mention.popMention({title: '响应体修改成功', content: '重新访问API将获取到新的mock数据'});
            console.log($scope.res);
            $scope.$emit('sendSet', 'res', $scope.selectAPI, $scope.res);
        }
    }
    $scope.toSetNewRequest = event => {
        if (event.keyCode == 83 && event.ctrlKey){
            Mention.popMention({title: '请求体修改成功', content: '重新访问API将获取到新的mock数据'});
            $scope.$emit('sendSet', 'req', $scope.selectAPI, $scope.req);
        }
    }
    // 监听选择API
    $scope.$on('receiveSelectedAPI', (event, selectAPI) => {
        console.log('after', selectAPI);
        $scope.selectAPI = selectAPI;
        $scope.req = jsonFormat($scope.selectAPI.req, {type: 'space', spaces: 2});
        $scope.res = jsonFormat($scope.selectAPI.res, {type: 'space', spaces: 2});
    });
    // 监听选择调试模式
    $scope.$on('receiveSelectedGlobalMode', (event, mode) => {
        if($scope.selectAPI){
            $scope.selectAPI.debugging = mode=='mock'? true:false;
        }
    });

});