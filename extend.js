const isFunc = (o) => typeof o === 'function'

const isArray = (o) => o instanceof Array

function flatten(arr) {
    while (arr.some(item => Array.isArray(item))) {
      arr = [].concat(...arr)
    }
    return arr
}

function getCurrentPage() {
    const pages = getCurrentPages()
    const last = pages.length - 1
    const target = pages[last] // 当前页面实例
    return target
}

// key字符串解析方法
// 解析结果：
// "a.b.c['d'].e[0]" -> ['a', 'b', 'c', 'd', 'e', 0]
function parseKeyString(keyString) {
    // 分割逗点
    const splitArr = keyString.split('.')
    // 提取中括号
    const keyArr = splitArr.map(i => {
        // 匹配提取多个中括号
        const matches = i.match(/\[(.+?)\]/g) || []
        // 加上开头
        return [ i.replace(/\[(.)*\]/g, '') , ...matches]
    })
    // 数组扁平化处理
    const flat = flatten(keyArr)
    const result = flat.map(item => {
        // 去掉中括号以及引号，只取键名
        const flag = item.replace(/\[/, '').replace(/\]/, '').replace(/"/g, '').replace(/'/g, '')
        const num = Number(flag)
        // 用isNaN判断是否可转换为数字，若可以，则证明是索引，返回Number类型
        return isNaN(num) ? flag : num
    })
    return result
}

function getDataValue({target: _target, key}) {
    const target = _target || getCurrentPage()
    const keyStrings = parseKeyString(key)
    let val = target.data
    keyStrings.forEach(property => {
        val = val[property]
    })
    return val
}

function watchSetData({target: _target, before, after, openHistory}) {
    const currentPage = getCurrentPage()

    const target = _target || currentPage
    target.originalSetData = target.setData
    target.setData = function (params) {
        const oldVals = {}
        if (openHistory) {
            Object.keys(params).forEach(key => {
                oldVals[key] = getDataValue({target, key})
            })
        }
        const newVals = params

        let isStop = false
        
        if (isArray(before)) {
            try {
                before.forEach(callback => {
                    if (isFunc(callback)) {
                        isStop = callback({
                            oldVals,
                            newVals
                        }) === false

                        if (isStop) throw Error(0)
                    }
                })
            } catch (e) {}
        } else if (isFunc(before)) {
            isStop = before({
                oldVals,
                newVals
            }) === false
        }

        if (!isStop) {
            target.originalSetData(params)

            if (isArray(after)) {
                after.forEach(callback => {
                    if (isFunc(callback)) {
                        callback({
                            oldVals,
                            newVals
                        })
                    }
                })
            } else if (isFunc(after)) {
                after({
                    oldVals,
                    newVals
                })
            }
        }
    }
}

export default watchSetData
