// 用来保存结果
var res = 0;
 
function loopGetLevel(obj, level) {
    //初始化获取层级，默认层级是0
    var level = level ? level : 0;
    //当前数据是不是对象，是对象就继续，否则比较下层级和值，哪个大取哪个
    if (typeof obj === 'object') {
        //对对象的每个属性进行遍历，如果还是对象就递归计算，否则就比较res和level取最大值
        for (var key in obj) {
            if (typeof obj[key] === 'object') {
                loopGetLevel(obj[key], level + 1);
            } else {
                res = level + 1 > res ? level + 1 : res;
            }
        }
    } else {
        res = level > res ? level : res;
    }
}

var a = {
    b:{
        c:1
    }
}

var b = {
    c:1,
    d:{
        c:1
    }
}

var c = null

var d = [{a:1},{a:{b:1}}]

var e = {
    a:1,
    b:[{
        c:1
    }]
}

var f ={}
f.d = f

loopGetLevel(a)
console.log(res)