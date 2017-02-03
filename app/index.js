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

    $scope.$on('sendSelectedAPI', (event, selectAPI) => {
        $scope.$broadcast("receiveSelectedAPI", selectAPI);
    });

    $scope.$on('sendSelectedMode', (event, selectAPI) => {
        $scope.$broadcast('receiveSelectedMode', selectAPI);
    });

    $scope.$on('sendSet', (event, type, selectAPI, content) => {
        console.log('here-2');
        $scope.$broadcast('receiveSet', type, selectAPI, content);
    })
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
                                debugging: true
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
        $scope.$emit('sendSelectedAPI', Object.assign({}, $scope.APIList[block]['apis'][api], { name: api }));
        $scope.selectedAPI = api;
    };

    // 标签页切换
    $scope.toggleTab = tab => {
        $scope.activeTab = tab;
    };

    // api块显隐切换
    $scope.blockToggleDisplay = key => {
       $scope.APIList[key]['showDetail'] = !$scope.APIList[key]['showDetail'];
    };

    // 切换响应模式
    $scope.modeToggle = mode => {
        let testNum = 0;
        $scope.mode = mode;
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
                    $scope.$emit('sendSelectedAPI', Object.assign({}, $scope.APIList[blockName]['apis'][selectAPI.name], { name: selectAPI.name }));
                }else{ // 重置
                    $scope.APIList[blockName]['apis'][selectAPI.name][type] = $scope.APISourceList[blockName]['apis'][selectAPI.name][type];
                    $scope.$emit('sendSelectedAPI', Object.assign({}, $scope.APIList[blockName]['apis'][selectAPI.name], { name: selectAPI.name }));
                }
            }
        };

        // 与主进程同步API列表数据
        ipcRenderer.send('setNewAPIList', $scope.APIList);
    })
});

// API细节模块控制器
app.controller("controlPadController", $scope => {

    // initialState
    $scope.selectAPI = null;
    $scope.server = ''; // 目的服务器地址
    $scope.testMode = 'frontEnd';
    $scope.sendFormat = 'query';
    $scope.receiveFormat = 'json';


    // 切换API调试模式
    $scope.toggleTest = () => {
        $scope.$emit('sendSelectedMode', $scope.selectAPI);
        $scope.selectAPI.debugging = !$scope.selectAPI.debugging;
    };
    // 切换调试环境
    $scope.testModeToggle = testMode => {
        $scope.testMode = testMode;
    };
    // 选择请求格式
    $scope.selectRequestFormat = format => {
        $scope.sendFormat = format;
    };
    // 选择响应格式
    $scope.selectAnswerFormat = format => {
        $scope.receiveFormat = format;
    };
    // 重置请求体
    $scope.resetReq = () => {
        $scope.$emit('sendSet', 'req', $scope.selectAPI);
    }
    // 重置响应体
    $scope.resetRes = () => {
        $scope.$emit('sendSet', 'res', $scope.selectAPI);
    }

    // 实现ctrl+S保存修改
    $scope.toSetNewAnswer = event => {
        if (event.keyCode == 83 && event.ctrlKey){
            $scope.$emit('sendSet', 'res', $scope.selectAPI, $scope.res);
        }
    }
    $scope.toSetNewRequest = event => {
        if (event.keyCode == 83 && event.ctrlKey){
            $scope.$emit('sendSet', 'req', $scope.selectAPI, $scope.req);
        }
    }
    // 监听选择API
    $scope.$on('receiveSelectedAPI', (event, selectAPI) => {
        $scope.selectAPI = selectAPI;
        $scope.req = jsonFormat($scope.selectAPI.req, {type: 'space', spaces: 2});
        $scope.res = jsonFormat($scope.selectAPI.res, {type: 'space', spaces: 2});
    });
})