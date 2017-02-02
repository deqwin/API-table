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
    })
})

// 列表模块控制器
app.controller("listController", $scope => {

    // initialState
    $scope.testNum = 0;
    $scope.APIList = {};
    $scope.selectedAPI = '';
    $scope.activeTab = 'all'; // 当前标签页
    $scope.hasReadAPIFile = false; // 是否读取到API文档
    $scope.error = false; // 是否发生导入错误
    $scope.mode = 'mock'; // 当前模式
    $scope.server = ''; // 目的服务器地址


    // 获取到API文档路径
    $scope.doneGetPath = path => {

        let apiSource = window.dynamicRequire(path);

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
                                debugging: false
                            }; 
                            if(folderObj[apiName].method == undefined){
                                throw('非标准API');
                                return;
                            }
                            if( folderObj[apiName].req == undefined)
                                addObject.req = {};
                            APIList[folderName]['apis'][apiName] = Object.assign({},apiObject,addObject);
                        }
                    }
                }
            }
            $scope.APIList = APIList;
        }catch(error){
            console.error(error);
            apiSource = null;
        };


        // 将获取到的API集合发送给主进程
        // ipcRenderer.send()


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
        $scope.mode = mode;
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
        }
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

    $scope.toggleTest = () => {
        $scope.$emit('sendSelectedMode', $scope.selectAPI);
        $scope.selectAPI.debugging = !$scope.selectAPI.debugging;
    };
    $scope.testModeToggle = testMode => {
        $scope.testMode = testMode;
    };
    $scope.selectRequestFormat = format => {
        $scope.sendFormat = format;
    };
    $scope.selectAnswerFormat = format => {
        $scope.receiveFormat = format;
    };


    $scope.$on('receiveSelectedAPI', (event, selectAPI) => {
        $scope.selectAPI = selectAPI;
        $scope.req = jsonFormat($scope.selectAPI.req, {type: 'space', spaces: 2});
        $scope.res = jsonFormat($scope.selectAPI.res, {type: 'space', spaces: 2});
    });
})