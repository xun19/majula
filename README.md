# majula

### 介绍
一个飞书小程序setData方法监听器

### 功能
- 对调用setData方法进行监听
- 包含更新前、更新后两种触发时机
- 获取当前被更改属性的旧值
- 拦截setData方法的值变更
- 基于原生语法实现，没有其它依赖，复制代码直接使用即可

### 能用它来实现什么？
- 类updated特性：
```javascript
import watchSetData from 'majula'

Page({
    onLoad(){
        watchSetData({
            openHistory: true,
            before: ({oldVals, newVals}) => {
                if ('a' in newVals) {
                    console.log('a will update, current oldVal:', oldVals.a)
                }
            },
            after: ({oldVals, newVals}) => {
                if ('a' in newVals) {
                    console.log('a updated:', newVals.a)
                }
            }
        })
    }
})
```

- 类computed特性：
```javascript
import watchSetData from 'majula'

Page({
    onLoad(){
        watchSetData({
            after: ({oldVals, newVals}) => {
                if ('a' in newVals || 'b[0]' in newVals || 'c.val' in newVals) {
                    this.setData({
                        total: Number(this.data.a) + Number(this.data.b[0]) + Number(this.data.c.val),
                        stringifyB: JSON.stringify(this.data.b),
                        stringifyC: JSON.stringify(this.data.c)
                    })
                }
            }
        })
    }
})
```

- 执行多个回调：
```javascript
import watchSetData from 'majula'

Page({
    onLoad: function (options) {
        watchSetData({
            openHistory: true,
            before: [
                (params) => {
                    console.log('before1', params)
                },
                (params) => {
                    console.log('before2', params)
                },
                (params) => {
                    console.log('before3', params)
                }
            ],
            after: [
                (params) => {
                    console.log('after1', params)
                },
                (params) => {
                    console.log('after2', params)
                },
                (params) => {
                    console.log('after3', params)
                }
            ]
        })
    }
})
```

- 拦截更改：
```javascript
import watchSetData from 'majula'

Page({
    onLoad: function (options) {
        watchSetData({
            openHistory: true,
            before: [
                (params) => {
                    console.log('before1', params)
                },
                (params) => {
                    console.log('before2', params)
                    if (paramas.newVals.name !== 'Ace') return false
                },
                (params) => {
                    console.log('before3', params)
                }
            ],
            after: [
                (params) => {
                    console.log('after1', params)
                },
                (params) => {
                    console.log('after2', params)
                },
                (params) => {
                    console.log('after3', params)
                }
            ]
        })
    }
})
```
- 基于它，封装出你喜欢的更多、更便捷的功能和特性
```javascript
import superData from 'your-extend'
Page({
    onLoad() {
        // 更便捷、更语义化的扩展特性
        superData({
            data: {},
            computed: {},
            updated: {}
        })
    }
})
```
