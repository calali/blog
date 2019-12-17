var _ = require('lodash');

// var obj1 = {}; 
// var obj = {name:'aaaaa'};
// obj1.t1 = obj;
// obj1.t2 = obj;

// var obj2 = _.cloneDeep(obj1); 
// obj1.t1.name = 'change'; 
// obj2.t1.name  = 'change2';
// console.log(obj2); 

// var obj3 = {}
// obj3.a = obj3
// var obj4 = _.cloneDeep(obj3); 
// console.log(obj4)
function createData(deep, breadth) {
    var data = {};
    var temp = data;

    for (var i = 0; i < deep; i++) {
        temp = temp['data'] = {};
        for (var j = 0; j < breadth; j++) {
            temp[j] = j;
        }
    }

    return data;
}
// var obj3 = createData(10000,1)
// var obj4 = _.cloneDeep(obj3)
// console.log(obj4) 

var obj5 = {a:function(){}}
var obj6 = _.cloneDeep(obj5)
console.log(obj6) 