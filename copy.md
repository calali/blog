javascript之深拷贝的实现

### 深浅拷贝
JavaScript里面有7种数据类型：undefined null boolean number string symbol object。
其中undefined null boolean number string 是基础数据类型，它们的拷贝只能是值的拷贝。
object是复杂数据类型，有深浅拷贝的区分。拷贝后指向同一个引用地址则是浅拷贝，只复制值且引用地址不同的是深拷贝。

源对象称为a,目标对象称为b。    
浅拷贝(shallow clone)是指a和b指向同一个内存地址，其中一个改变时，另一个随之改变。
深拷贝(deep clone)是指b的数据从a拷贝出来以后，a或b的数据变化不再引起另一个对象的数据的改变。

请看下面例子：
```javascript
// 浅拷贝
var obj1 = {a:1}
var obj2 = obj1
obj1.a = 2
console.log(obj2) // {a: 2}

// 深拷贝
var obj3 = {a:1}
var obj4 = JSON.parse(JSON.stringify(obj3))
obj3.a = 2
console.log(obj4) // {a: 1}

// 深拷贝
var obj5 = {a:1}
var obj6 = Object.assign({},obj5)
obj5.a = 2
console.log(obj6) // {a: 1}
```
### 常见的拷贝实现
上文中我们使用JSON.parse(JSON.stringify())和Object.assign成功实现了对象的深拷贝。但是这些拷贝方法在一些情况下会有问题。让我们一一来看。

1. JSON.parse和JSON.stringify

1.1 不能处理reg、function、symbol数据类型。
```javascript
var obj1 = {
    arr:[1,2],
    syb:Symbol(),
    func(){},
    reg:/\d+/,
    date:new Date()
}
var obj2 = JSON.parse(JSON.stringify(obj1)) 
console.log(obj2) // { arr: [ 1, 2 ], reg: {}, date: '2019-12-13T03:53:44.016Z' }
```
在复制后，obj2失去了reg的正则值，失去了syb和func两个属性。       

1.2 不能处理循环引用。
再看下面例子：
```javascript
var obj1 = {
    a:obj1
}
var obj2 = JSON.parse(JSON.stringify(obj1)) 
console.log(obj2) // {}
console.log(obj1) // {a: undefined}
```

1.3 相同的引用会被重复复制，而不是引用复制。
```javascript
var obj1 = {  a:123 }; 
var obj = {name:'aaaaa'};
obj1.t1 = obj;
obj1.t2 = obj;
var obj2 = JSON.parse(JSON.stringify(obj1)); 
obj1.t1.name = 'change'; 
obj2.t1.name  = 'change';
console.log(obj1); // { a: 123, t1: { name: 'change' }, t2: { name: 'change' } }
console.log(obj2); // { a: 123, t1: { name: 'change' }, t2: { name: 'aaaaa' } }
```

obj1的t1和t2指向同一个引用，因此同时改变。obj2的t1和t2没有同时改变，说明他们没有指向同一个引用地址，不符合预期。

2. Object.assign
```javascript
var obj1 = {  a:{b:1} };
var obj2 = Object.assign({},obj1) 
obj1.a.b = 2
console.log(obj2)
```
Object.assign只支持第一层的深拷贝，后续都是浅拷贝了。

### 典型的深拷贝的实现
既然上述的拷贝方法都有问题，那么有没有比较全面的深拷贝方法呢？
我们期望的深拷贝：
    1. 无论对象嵌套多少层，都可以实现深拷贝
    2. 可以处理reg、function、symbol等数据类型
    3. 可以处理循环引用
    4. 相同的引用按照引用复制，而不是重复复制。

1. 无论对象嵌套多少层，都可以实现深拷贝
对对象值进行循环复制，当对象值是对象时，递归直到值不是对象实现多层数据拷贝。

```javascript
function isObject(x) {
    return Object.prototype.toString.call(x) === '[object Object]'; // 注意这里
}

function clone(source) {
    var target = {};
    for(var i in source) {
        if (source.hasOwnProperty(i)) {
            if (isObject(source[i])) {
                target[i] = clone(source[i]); // 注意这里
            } else {
                target[i] = source[i];
            }
        }
    }

    return target;
}
var obj1 = {  a:{b:1} };
var obj2 =clone(obj1)
obj1.a.b = 2
console.log(obj2) // { a: { b: 1 } }
```
我们用以下代码检测clone方法
```javascript
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
console.log(createData(1,3)) // { data: { '0': 0, '1': 1, '2': 2 } }
console.log(createData(3,1)) // { data: { '0': 0, data: { '0': 0, data: {'0' :0 } } } }
```

```javascript
// createData和clone都是上文中定义的方法，此处省略
var obj1 = createData(1,10000)
var obj2 = clone(obj1)
console.log(obj2) // 正确打印结果

var obj3 = createData(10000,1)
var obj4 = clone(obj3)
console.log(obj4) // RangeError: Maximum call stack size exceeded
```

clone方法对于深度太大的对象进行复制，由于递归调用会出现堆栈溢出的问题。我们改用循环来实现递归。
```javascript
function cloneLoop(x) {
    const root = {};

    // 栈
    const loopList = [
        {
            parent: root,
            key: undefined,
            data: x,
        }
    ];

    while(loopList.length) {
        // 深度优先
        const node = loopList.pop();
        const parent = node.parent;
        const key = node.key;
        const data = node.data;

        // 初始化赋值目标，key为undefined则拷贝到父元素，否则拷贝到子元素
        let res = parent;
        if (typeof key !== 'undefined') {
            res = parent[key] = {};
        }

        for(let k in data) {
            if (data.hasOwnProperty(k)) {
                if (isObject(data[k])) {
                    // 下一次循环
                    loopList.push({
                        parent: res,
                        key: k,
                        data: data[k],
                    });
                } else {
                    res[k] = data[k];
                }
            }
        }
    }

    return root;
}

var obj1 = createData(1,10000)
var obj2 = cloneLoop(obj1)
console.log(obj2) // 正确打印结果

var obj3 = createData(10000,1)
var obj4 = cloneLoop(obj3)
console.log(obj4) // 正确打印结果
```

2. 可以处理reg、function、symbol等数据类型

3. 可以处理循环引用

4. 相同的引用按照引用复制，而不是重复复制。
```javascript
function cloneForce(x) {
    // =============
    const uniqueList = []; // 用来去重
    // =============

    let root = {};

    // 循环数组
    const loopList = [
        {
            parent: root,
            key: undefined,
            data: x,
        }
    ];

    while(loopList.length) {
        // 深度优先
        const node = loopList.pop();
        const parent = node.parent;
        const key = node.key;
        const data = node.data;

        // 初始化赋值目标，key为undefined则拷贝到父元素，否则拷贝到子元素
        let res = parent;
        if (typeof key !== 'undefined') {
            res = parent[key] = {};
        }
        
        // =============
        // 数据已经存在
        let uniqueData = find(uniqueList, data);
        if (uniqueData) {
            parent[key] = uniqueData.target;
            break; // 中断本次循环
        }

        // 数据不存在
        // 保存源数据，在拷贝数据中对应的引用
        uniqueList.push({
            source: data,
            target: res,
        });
        // =============
    
        for(let k in data) {
            if (data.hasOwnProperty(k)) {
                if (typeof data[k] === 'object') {
                    // 下一次循环
                    loopList.push({
                        parent: res,
                        key: k,
                        data: data[k],
                    });
                } else {
                    res[k] = data[k];
                }
            }
        }
    }

    return root;
}

function find(arr, item) {
    for(let i = 0; i < arr.length; i++) {
        if (arr[i].source === item) {
            return arr[i];
        }
    }

    return null;
}

var obj1 = {  a:123 }; 
var obj = {name:'aaaaa'};
obj1.t1 = obj;
obj1.t2 = obj;
var obj2 = cloneForce(obj1); 
obj1.t1.name = 'change'; 
obj2.t1.name  = 'change';
console.log(obj1); // { a: 123, t1: { name: 'change' }, t2: { name: 'change' } }
console.log(obj2); // { a: 123, t1: { name: 'change' }, t2: { name: 'change' } }
```
### 总结

### 问题
1 symbol数据类型的拷贝存不存在？是怎么处理的？


### 参考资料
https://segmentfault.com/a/1190000016672263