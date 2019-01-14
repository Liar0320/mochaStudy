/*
 * @Author: liar
 * @Date: 2019-01-08 10:03:10
 * @Last Modified by: liar
 * @Last Modified time: 2019-01-14 19:37:07
 */
(function () {
    'use strict';

    angular
        .module('sideBar', [])
        .controller('sideBarController', sideBarController);

    sideBarController.$inject = ['$rootScope', '$state', '$location', 'ConfigData', 'routerConfig'];
    function sideBarController ($rootScope, $state, $location, ConfigData, routerConfig) {
        var vm = this;
        var PARAMMATCH = /:\w+/g; // 匹配:type 之类的  带参数url
        routerConfig = angular.copy(routerConfig);
        $rootScope.$watch('app.state.id', function (v) {
            activate(v);
        });

        var selectMenus = []; // 选择的菜单栏
        vm.selectId = ''; // 选中的id;

        function init () {
            //  var rows = ConfigData.menuRows;
            //  vm.rows = sortToMenus(rows);
            vm.rows = sortToMenusFormPjid($rootScope.app.menuList.childs, 0);
        }

        /** 根据菜单rows转换为其他菜单格式
         *
         * @param {*} rows 菜单rows
         */
        function sortToMenus (rows) {
            var result = [];

            rows.forEach(function (element) {
                var temp = {
                    id: '',
                    title: '',
                    url: '',
                    pid: '',
                    expand: false,
                    width: 40,
                    level: 0,
                    children: []
                };
                $.setObjByObj(temp, element);
                // temp.pid = Number(temp.pid);
                if (temp.children === undefined) temp.children = [];
                if (element.pid !== '') {
                    var item = searchPidBy(element.pid, result);
                    temp.width = item.width + 20;
                    temp.level = item.level + 1;
                    if (item) item.children.push(temp);
                } else {
                    if (temp.pid === '') temp.pid = element.id;
                    result.push(temp);
                }
            });

            return result;
        }

        function sortToMenusFormPjid (branch, level) {
            for (var i = 0; i < branch.length; i++) {
                var item = branch[i];
                item._id = item.id;
                item._pid = item.pid;
                item.title = item.resourceName;
                item.url = item.resourceValue;
                item.expand = false,
                item.width = 40 + level * 20;
                item.level = level;
                item.children = item.childs || [];
                if (item.resourceValue) {
                    var menu = getObjFormArray(routerConfig, 'url', item.resourceValue);
                    if (menu) {
                        item.id = menu.id;
                        item.pid = menu.pid;
                    };
                }
                delete item.childs;
                if (item.children.length > 0) {
                    sortToMenusFormPjid(item.children, item.level + 1);
                }
            }
            return branch;
        }

        function getObjFormArray (arr, k, v) {
            var reuslt;
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];
                var url = item[k];
                // 如果是带参数的url则使用正则解析
                if (url.match(PARAMMATCH)) var reg = new RegExp(url.replace(PARAMMATCH, '\\w+'));
                if (typeof reg === 'object' && reg.test(v)) {
                    reuslt = arr[i];
                    break;
                }
                if (url === v) {
                    // reuslt = arr[i];
                    reuslt = arr.splice(i, 1)[0];
                    break;
                }
            }
            return reuslt;
        }

        /**
         * 寻找父级菜单
         * @param {*} pid 父级id
         * @param {*} branch 需要搜索的机构
         */
        function searchPidBy (pid, branch) {
            for (var i = 0; i < branch.length; i++) {
                var item = branch[i];
                if (item.id === pid) return item;
                if (item.children.length > 0) {
                    var temp = searchPidBy(pid, item.children);
                    if (temp) return temp;
                }
            }
        }

        // 点击菜单
        vm.menuClick = function (menu, rows) {
            // 如果存在菜单url
            if (menu.url) {
                // activate(menu.id);
                if (menu.level === 0) setIsCollapse(menu, rows); // 如果是第一级跳转
                var URL_MATCH = /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/;
                if (URL_MATCH.test(menu.url)) {
                    window.open(menu.url);
                } else {
                    $location.path('frame' + menu.url);
                }
            } else {
                setIsCollapse(menu, rows);
            }
        };

        /** 如果不是页面则  展开或者收缩  点击任何一个菜单都关闭其他相对应的菜单  即 row.expanded = false;
         * @param {*} menu 选中的菜单
         * @param {*} rows 本级所有菜单
         */
        function setIsCollapse (menu, rows) {
            var status = !menu.expand;
            angular.forEach(rows, function (v) {
                v.expand = false;
            });
            menu.expand = status;
        };

        /** 选中当前菜单并且将它和父级全部选中。即row.selected = true;
         * @param {*} pid 父级菜单
         * @param {*} branch 需要编辑的结构
         * @param {*} result 结果 return []
         */
        function setSelected (pid, branch, result) {
            for (var i = 0; i < branch.length; i++) {
                var item = branch[i];
                if (item.id === pid) {
                    item.selected = true;
                    if (!item.expand) item.expand = true;
                    result.push(item);
                    return result;
                }
                if (item.children.length > 0) {
                    var temp = setSelected(pid, item.children, result);
                    if (temp) {
                        item.selected = true;
                        if (!item.expand) item.expand = true;
                        return result.push(item);
                    }
                }
            }
        }

        function activate (id) {
            vm.selectId = id;
            if (selectMenus.length > 0) {
                angular.forEach(selectMenus, function (res) {
                    res.selected = false;
                });
                selectMenus = [];
            }
            setSelected(id, vm.rows, selectMenus);
        }

        function searchPid (stateName, menus) {
            if (menus.stateName) {
                if (menus.stateName === stateName) return true;
                if (foreachMenus(menus.children, stateName)) return true;
            } else {
                if (foreachMenus(menus.children, stateName)) return true;
            }

            return false;
        }

        function foreachMenus (menus, stateName) {
            if (menus.length > 0) {
                for (var i = 0; i < menus.length; i++) {
                    if (searchPid(stateName, menus[i])) return true;
                }
            }
            return false;
        }

        init();
    }
})();

angular.module('sideBar').service('tree', function () {
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

    this.enhanceTree = function (tree, childName, level) {
        if (Object.prototype.toString.call(tree) === '[object Arrary]') throw new Error('数据必须为数组');
        if (!level) {
            level = 0;
        }
        angular.forEach(tree, function (branch, index) {
            enhanceTree(branch, childName, level);
            if (!branch.$last) {
                this.enhanceTree(branch[childName], childName, level + 1);
            }
        });
    };
});

// vm.gohref = function (e, menu, parent) {
//     var stateUrl = menu.url; var menuId = menu.id; var pid = menu.pid;
//     //   e.stopPropagation();
//     if (!stateUrl) {
//         // var pid = vm.rows[$index].pid;
//         // if (pid === vm.appState.pid) { return (vm.appState.isCollapse[pid] = !vm.appState.isCollapse[pid]); }
//         // var stateParent = vm.rows[$index];
//         // if (stateParent.children.length > 0) {
//         //     stateUrl = stateParent.children[0].url;
//         //     $location.path('frame' + stateUrl);
//         // } else {
//         //     $location.path('frame' + stateParent.url);
//         // }
//     } else {
//         e.stopPropagation();
//         vm.appState.id = menuId;
//         if (selectMenu.length > 0) {
//             angular.forEach(selectMenu, function (res) {
//                 res.onUrl = false;
//             });
//             selectMenu = [];
//         }
//         setOnUrl(menu.id, vm.rows, selectMenu);

//         var URL_MATCH = /^((ht|f)tps?):\/\/([\w\-]+(\.[\w\-]+)*\/)*[\w\-]+(\.[\w\-]+)*\/?(\?([\w\-\.,@?^=%&:\/~\+#]*)+)?/;
//         if (URL_MATCH.test(stateUrl)) {
//             window.open(stateUrl);
//         } else {
//             $location.path('frame' + stateUrl);
//         }
//     }
// };
