let hasObj = [];
function referCopy(obj) {
    let copy = {};
    hasObj.push(obj);
    for (let i in obj) {
        if (typeof obj[i] === 'object') {
            let index = hasObj.indexOf(obj[i]);
            if (index > -1) {
                console.log('存在循环引用或属性引用了相同对象');
                // 如果已存在，证明引用了相同对象，那么无论是循环引用还是重复引用，我们返回引用就可以了
                copy[i] = hasObj[index];
            } else {
                copy[i] = referCopy(obj[i]);
            }
        } else {
            copy[i] = obj[i];
        }
    }
    return copy;
}
var obj1 = {  a:123 }; 
var obj = {name:'aaaaa'};
obj1.t1 = obj;
obj1.t2 = obj;

var obj2 = referCopy(obj1); 
obj1.t1.name = 'change'; 
obj2.t1.name  = 'change2';
console.log(obj2);