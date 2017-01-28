/**
 * 渲染进程模块
 * created by deqwin
 * 2017/1/27
 */
require('./index.scss');

const angular = require('angular');
const electron = require('electron');
const { ipcRenderer } = electron;

angular.module("myapp", [])
    .controller("HelloController", function($scope) {
    $scope.helloTo = {};
    $scope.helloTo.title = "AngularJS";
});