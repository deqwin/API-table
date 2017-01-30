/**
 * 渲染进程模块
 * created by deqwin
 * 2017/1/27
 */
import angular from 'angular'; 
import electron from 'electron';
const { ipcRenderer } = electron;
// import { userPCWeb } from '../../api/index.js';
// const a = require('./appServer.js');

angular.module("myApp", []).controller("listController", function($scope) {
    $scope.testNum = 0;
    $scope.APIList = {
		wenku: {
            showDetail: false,
            apis: {
                '/wenku/getFileInfo': {
                    debugging: true, //是否在调试中
                    method: 'GET',
                    req: {
                        a1: 'arg1',
                        a2: 'arg2',
                        a3: 'arg3'
                    },
                    res: {
                        b1: 'bb1'
                    }
                },
                '/wenku/getFileDetailInfo': {
                    debugging: false, //是否在调试中
                    method: 'POST',
                    req: {
                        a1: 'arg1',
                        a2: 'arg2',
                        a3: 'arg3'
                    },
                    res: {
                        b1: 'bb1'
                    }
                }
            }
			
		},
		library: {
            showDetail: true,
            apis: {
                '/library/getFileInfo': {
                    debugging: false, //是否在调试中
                    method: 'GET',
                    req: {
                        a1: 'arg1',
                        a2: 'arg2',
                        a3: 'arg3'
                    },
                    res: {
                        b1: 'bb1'
                    }
                },
                '/library/getFileDetailInfo': {
                    debugging: false, //是否在调试中
                    method: 'GET',
                    req: {
                        a1: 'arg1',
                        a2: 'arg2',
                        a3: 'arg3'
                    },
                    res: {
                        b1: 'bb1'
                    }
                }
            }		
		}
	};
    $scope.hasReadAPIFile = false;
    $scope.error = false;
    $scope.doneGetPath = path => {
        let apiBlock = window.dynamicRequire(path);
        if(apiBlock){
            $scope.hasReadAPIFile = true;
        }else{
            $scope.error = true;
        }
        $scope.$apply();
    };
    $scope.blockToggleDisplay = key => {
       $scope.APIList[key]['showDetail'] = !$scope.APIList[key]['showDetail'];
    };
    $scope.mode = 'mock';
    $scope.server = '';
    $scope.modeToggle = mode => {
        $scope.mode = mode;
        $scope.hasReadAPIFile = !$scope.hasReadAPIFile;
    };
    // console.log(a);
});