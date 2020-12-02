## 一、简答题

### 1、当我们点击按钮的时候动态给 data 增加的成员是否是响应式数据，如果不是的话，如何把新增成员设置成响应式数据，它的内部原理是什么？

```
let vm = new Vue({
 el: '#el'
 data: {
  o: 'object',
  dog: {}
 },
 method: {
  clickHandler () {
   // 该 name 属性是否是响应式的
   this.dog.name = 'Trump'
  }
 }
})

```

答：不是响应式数据。响应式数据是在vue初始化时使用Object.defineProperty()方法把每个属性转换成getter和setter，并对其进行监听，从而达到响应式的效果。
把新成员设置成响应式数据，有两种方法：

* 可以使用Vue.set(vm.someObject, key, value)方法向嵌套对象添加响应式属性。这个方法的原理是调用了defineReactive方法将属性转化为getter和setter方法。
* 给 dog 的 name 属性设置一个初始值。这样vue在初始化的时候，会把 name 属性转换成getter和setter，数据就是响应式的了


### 2、请简述 Diff 算法的执行过程。
答：

* diff 算法的过程是调用 patch 函数的过程，这个函数用来比较新旧节点，为DOM打补丁，并返回vnode。
* patch 函数接收两个参数，oldVnode 和 vnode,使用 sameVnode 函数来比较两个新旧节点是否相同。
* sameVnode(oldVnode, vnode)返回结果为布尔值，返回true，执行patchVnode 函数；返回false，则vnode替换oldVnode。
* patchVnode 函数的执行过程如下：
  * 获取真是DOM，定义为常量 elm
  * 判断 oldVnode 和 vnode 内存地址是否相同
    * 如果是，说明节点并没有发生变化，直接return
    * 如果不是，再判断 vnode 的 data 属性，如果有定义，先遍历执行模块内的update钩子函数，再执行用户设置的 update 钩子函数
  * 判断vnode是否都有text属性，如果都有，且不相等，判断oldVnode是否有子节点，如果有则移除，并为DOM元素的textContent设置为 vnode.text
  * 如果 oldVnode 有子节点而 vnode 没有，则删除 elm 的子节点
  * 如果 oldVnode 没有子节点而 vnode 有，则将vnode的子节点添加到 elm
  * 如果新旧节点都有子节点，则执行 updateChildren 函数比较子节点，此函数是diff算法的核心
    * updateChildren 函数执行过程如下：
      * 在进行同级别节点比较的时候，首先会对新老节点数组的开始和结尾节点设置标记索引，遍历过程中移动索引
      * 在对开始和结束节点比较的时候，总共有四种情况：
        * oldStartVnode / newStartVnode(旧开始节点/新开始节点)
        * oldEndVnode / newEndVnode(旧结束节点/新结束节点)
        * oldStartVnode / newEndVnode(旧开始节点/新结束节点)
        * oldEndVnode / newStartVnode(旧结束节点/新开始节点)
      * 一、oldStartVnode 与 newStartVnode 是 sameVnode (key和sel相同)
        * 调用 patchVnode() 对比和更新节点
        * 把旧开始和新开始索引往后移动 oldStartIdx++ / newStartIdx++
      * 二、oldEndVnode 与 newEndVnode 是 sameVnode (key和sel相同)
        * 调用 patchVnode() 对比和更新节点
        * 把旧结束和新结束索引往前移动 oldEndIdx-- / newEndIdx--
      * 三、oldStartVnode 与 newEndVnode 是 sameVnode (key和sel相同)
        * 调用 patchVnode() 对比和更新节点
        * 把 oldStartVnode 对应的 DOM 元素移动到最右边
        * 更新索引 oldStartIdx++ / newEndIdx--
      * 四、oldEndVnode 与 newStartVnode 是 sameVnode(key和sel相同)
        * 调用 patchVnode() 对比和更新节点
        * 把 oldEndVnode 对应的 DOM 元素移动到最左边
        * 更新索引 oldEndIdx-- / newStartIdx++
      * 如果不是以上四种情况
        * 使用 newStartVnode 的 key 在老节点数组中找相同节点
        * 如果没找到，说明 newStartVnode 是新节点，则创建新节点对应的DOM元素，插到DOM树中
        * 如果找到了，判断新节点和老节点的 sel 选择器是否相同，如果不相同，说明节点修改，重新创建对应的DOM插入DOM树；如果相同，把elmToMove 对应的 DOM 元素，移动到左边
      * 循环结束之后，如果老节点的数组先遍历完(oldStartIdx > oldEndIdx),说明新节点有剩余，把剩余节点批量插入到右边（即newStartIdx到newEndIdx之间的节点），如果新节点的数组先遍历完成（newStartIdex > newEndIdex），说明旧节点有剩余，把剩余节点批量删除（即oldStartIdx到oldEndIdx之间的节点）

## 二、编程题


### 1、模拟 VueRouter 的 hash 模式的实现，实现思路和 History 模式类似，把 URL 中的 # 后面的内容作为路由的地址，可以通过 hashchange 事件监听路由地址的变化。

*代码位置：code/vueRouter*

### 2、在模拟 Vue.js 响应式源码的基础上实现 v-html 指令，以及 v-on 指令。

*代码位置：code/vue*

在Vue.js 响应式源码的基础上分别在 vue.js 和 compiler.js 文件中做了如下补充：

* vue.js 中增加把 methods 中的成员注入到 vue 实例中

```
class Vue {
  constructor (options) {
    // 1. 通过属性保存选项的数据
    this.$options = options || {}
    this.$data = options.data || {}
    this.$methods = options.methods || {}
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el
    // 2. 把data中的成员转换成getter和setter，注入到vue实例中
    this._proxyData(this.$data)
      // 把methods中的成员注入到vue实例中
    this._proxyMethods(this.$methods)
    // 3. 调用observer对象，监听数据的变化
    new Observer(this.$data)
    // 4. 调用compiler对象，解析指令和差值表达式
    new Compiler(this)
  }
  _proxyData (data) {
    // 遍历data中的所有属性
    Object.keys(data).forEach(key => {
      // 把data的属性注入到vue实例中
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get () {
          return data[key]
        },
        set (newValue) {
          if (newValue === data[key]) {
            return
          }
          data[key] = newValue
        }
      })
    })
  }

  _proxyMethods (methods) {
    Object.keys(methods).forEach(key => {
      this[key] = methods[key]
    })
  }
}

```

* compiler.js 中增加的是：1、分析指令方法中对v-on类型的判断；2、对v-html指令的处理；3、对v-on指令的处理

```
  // 编译元素节点，处理指令
  compileElement (node) {
    // console.log(node.attributes)
    // 遍历所有的属性节点
    Array.from(node.attributes).forEach(attr => {
      // 判断是否是指令
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        console.log('====', attrName)
        // v-text --> text
        attrName = attrName.substr(2)
        let key = attr.value
        if (attrName.startsWith('on:')) {
          let event = attrName.replace('on:', '')
          return this.onUpdater(node, key, event)
        }
        this.update(node, key, attrName)
      }
    })
  }

    // 处理 v-html 指令
  htmlUpdater (node, value, key) {
    console.log('处理 v-html 指令', value)
    node.innerHTML = value
    new Watcher(this.vm, key, (newValue) => {
      node.innerHTML = newValue
    })
  }

  // 处理 v-on 指令
  onUpdater (node, key, event) {
    console.log('处理 v-on 指令', event, key)
    console.log('this.vm', this.vm)
    node.addEventListener(event, e => this.vm[key](e))
  }

```

### 3、参考 Snabbdom 提供的电影列表的示例，利用Snabbdom 实现类似的效果。

*代码位置：code/snabbdom*

