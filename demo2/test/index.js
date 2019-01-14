var expect = chai.expect;
describe("angularjs module",function () {
    describe("sideBar",function () {
        var treeData;
        beforeEach(function () {
            module("sideBar");
            treeData = [
                {
                    name:1
                },
                {
                    name:'2-1',
                    "children": [
                      {
                          name:'2-2'
                      }
                    ]
                },
                {
                    name:'3-1',
                  "children": [
                    {
                        name:'3-2',
                      "children": [
                        {
                            name:'3-3'
                        }
                      ]
                    }
                  ]
                }
              ]
        });
        it("ctrl is test",inject(function ($controller,tree) {
            var $scope = {};
            var indexCtrl = $controller("sideBarController",{$scope:$scope});
            expect($scope.name).to.be.equal('test');
        }));
        
        it("tree is enhance",inject(function (tree) {
            tree.enhanceTree(treeData)
            expect(treeData[2].children[0].children[0].$last).to.be.equal(true);
        }));
        
    })
    
})