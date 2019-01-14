/*
 * @Author: liar
 * @Date: 2019-01-08 10:03:10
 * @Last Modified by: liar
 * @Last Modified time: 2019-01-14 23:53:51
 */
(function () {
    'use strict';

    angular
        .module('sideBar', [])
        .controller('sideBarController', sideBarController)
        .service('tree',tree);

    sideBarController.$inject = ["$scope"];
    function sideBarController ($scope) {
        var vm = this;
        $scope.name = 'test'
    }

    function tree() {
        // TODO:  $selected , $hasChildren,$last ,$level ,$expanded
        /**
         *  对数据进行加强
         * @param {*} branch
         * @param {*} childName
         */
        function enhanceTree (branch, childName, level) {
            branch.$hasChildren = function () {
                var children = branch[childName];
                return angular.isArray(children) && children.length > 0;
            };
            branch.$last = !branch.$hasChildren();
    
            branch.$level = level;
    
            branch.$expanded = false;
            branch.$toggleExpanded = function () {
                return (this.$expanded = !this.$expanded);
            };
            branch.$isExpanded = function () {
                return this.$expanded;
            };
    
            branch.$selected = false;
            branch.$toggleSelected = function () {
                return (this.$selected = !this.$selected);
            };
            branch.$isSelected = function () {
                return this.$selected;
            };
        }
    
        function foreachTree(tree, childName, level) {
            if (Object.prototype.toString.call(tree) === '[object Arrary]') throw new Error('数据必须为数组');
            if (!level) {
                level = 0;
            }
            if(!childName){
                childName = 'children'
            }
            angular.forEach(tree, function (branch, index) {
                enhanceTree(branch, childName, level);
                if (!branch.$last) {
                    foreachTree(branch[childName], childName, level + 1);
                }
            });
        };
        this.enhanceTree = foreachTree
    }

    // angular.bootstrap(document,"test");
})();




