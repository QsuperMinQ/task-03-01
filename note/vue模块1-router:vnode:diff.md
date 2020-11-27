## vue模块一 课程介绍

* 快速回顾 Vue.js 基础语法
* Vue Router 原理分析与实现
* 虚拟 DOM 库 Snabbdom 源码解析
* 通过一个小项目响应式原理分析与实现
* Vue.js 源码分析：初始化过程、首次渲染过程、响应式的时间过程、编译模版的过程等等


### Task1
<hr/>
#### task1-2 Vue 基础结构
	
	h 函数用来创建虚拟dom，render函数用来把虚拟dom返回，$mount函数用来把虚拟dom转化为真实dom渲染到浏览器
	

#### task1-3 Vue 的生命周期


#### task1-4 Vue 语法与概念-上
	
 * 差值表达式
 	* 文本 {{msg}}
 	* 原始 HTML， 使用 v-html 例如：`<span v-html="rawHtml"></span>`
 	* Attribute， v-bind
 	* 使用 javacript 表达式
 * 指令
 	* v-bind
 	* v-if
 	* v-for
 	* v-on 监听DOM
 * 计算属性和侦听器
 * Class 和 Style 绑定
 * 条件渲染（if/show）/ 列表渲染
 * 表单输入绑定

#### task1-5 Vue 语法与概念-下
	
* 组件
* 插槽
* 插件
* 混入 mixin
* 深入响应式原理
* 不同构建版本的Vue


### Task2 Vue-Router 原理实现
<hr/>
#### task2-1 阶段内容
* Vue Router 基础回顾
* Hash 模式和 History 模式
* 模拟实现自己的 Vue Router

#### task2-2 基础回顾

* 创建路由相关组件（视图）
* 注册路由插件（Vue.use(VueRouter)）
* 创建 Router 对象，配置路由规则
* 注册 Router 对象，即，创建vue实例时，在选项配置中引入创建好的 Router 对象
* 通过 router-view 创建占位

#### task2-3 动态路由

通过路由传递参数实现动态路由的两种方式

* $route.params.id 通过路由规则获取参数
* props,在创建路由规则的时候开启props，props:true,这样就可以在模版中通过props接收

#### task2-4 嵌套路由

对于有相同头部和底部的组件可以用 layout 组件进行嵌套， 在路由规则内进行配置，嵌套的字页面在属性 children 中配置，例如：

```
const routes = [
  {
    name: 'login',
    path: '/login',
    component: Login
  },
  // 嵌套路由
  {
    path: '/',
    component: Layout,
    children: [
      {
        name: 'index',
        path: '',
        component: Index
      },
      {
        name: 'detail',
        path: 'detail/:id',
        props: true,
        component: () => import('@/views/Detail.vue')
      }
    ]
  }
]
```

#### task2-5 编程式导航

`this.$router.push({ name: 'Index', params: { id: 1 } })`

`this.$router.replace('Login')`

`this.$router.go(-2)`

#### task2-6 Hash 模式和 History 模式 区别

表现形式的区别

* Hash 模式 例如：https://music.com/#/palylist?id=11111
* History 模式 例如: https://music.com/playlist/11111


原理区别

* Hash 模式是基于锚点，以及 onhashchange 事件
* History 模式是基于 HTML5 中的 History API
	* history.pushState()

#### task2-7 History 模式

History 模式使用：

* History 需要服务器的支持
* 单页面应用中，服务器不存在router配置的路由地址，所以，这样的地址会返回找不到该页面
* 再服务器端应该除了静态资源外都返回单页面应用的 index.html

 
#### task2-8：node环境 History模式

```
const app = express()
// 注册处理 history 模式的中间件
app.use(history())

```

#### task2-9：nginx 环境 History模式

修改 nginx 的配置文件 nginx.conf,添加选项至 server/location中：

`try_files &uri $uri/ /index.html`



#### task2-10：vueRouter 实现原理

VueRouter类图

* options
* data
* routerMap
* Constructor(Options): VueRouter
* _install(Vue): void 静态方法
* init(): void
* initEvent(): void
* createRouterMap(): void
* initComponents(Vue): void

#### task2-12：vueRouter -- install

静态方法 install 主要完成三个任务：

1、判断当前install是否已经被安装

```
if(VueRouter.install.installed) return;
VueRouter.install.installed = true;
	
```
2、把vue的构造函数记录在全局

```
_vue = vue
```

3、把创建Vue实例传入的router对象注入到Vue实例

```
_vue.mixin({
	beforeCreate(){
		// 在这个生命周期中可以拿到vue实例的this
		// 因为这个勾子函数会多次执行，判断是否已经注入
		if(this.$options.router){
			_Vue.prototype.$touter = this.$options.router
		}
	}
})

```

完整的方法如下：

```
let _Vue = null;
class VueRouter {
	// 此方法需要接收两个参数，由于演示用，只接收第一个参数，第二个可选项参数暂不写
    static install(Vue){
        //1 判断当前插件是否被安装
        if(VueRouter.install.installed){
            return;
        }
        VueRouter.install.installed = true
        //2 把Vue的构造函数记录在全局
        _Vue = Vue
        //3 把创建Vue的实例传入的router对象注入到Vue实例
        // _Vue.prototype.$router = this.$options.router
        _Vue.mixin({
            beforeCreate(){
                if(this.$options.router){
                    _Vue.prototype.$router = this.$options.router
                    
                }
               
            }
        })
    }
}
```

#### task2-13：vueRouter -- 构造函数 construcor

构造函数初始化需要的三个属性：

```
constructor (options) {
	this.options = options;
	this.routeMap = {};
	this.data = _Vue.observable({
		current: '/'
	})
}

```

#### task2-14：vueRouter -- createRouteMap

遍历所有的路由规则，把路由规则解析成键值对的形式存储到routeMap中：

```
createRouteMap(){
	this.options.routes.forEach(route => {
		this.routeMap[route.path] = route.component;
	})
}
```


#### task2-15：vueRouter -- VueRouter-router-link

创建组件 outer-link，传入属性 to 用于接收要跳转的路径，这个组件最终要实现一个跳转的超链接：

```
initComponents(Vue){
	Vue.component('route-link', {
	
		props: {
			to: String
		},
		template: '<a :href="to"><slot></slot></a>'
	})
}
```
初始化方法包括存储 routeMap 和 初始化组件，应在router对象注入到Vue实例之后调用，所以，创建方法init：

```
_vue.mixin({
	beforeCreate(){
		// 在这个生命周期中可以拿到vue实例的this
		// 因为这个勾子函数会多次执行，判断是否已经注入
		if(this.$options.router){
			_Vue.prototype.$touter = this.$options.router;
			this.$options.router.init(); // 调用初始化方法
		}
	}
})


init(){
	this.createRouteMap();
	this.initComponents(_Vue);
}
```

#### task2-16-17：vue运行时版本 VS Vue完整版

运行时版本：不支持 template 模版，需要打包的时候提前编译

完整版： 包含运行时和编译器，体积比运行时版打10k左右，程序运行的时候把模版转换成 render 函数

*运行时版本 转换 完整版方法：创建vue.config.js,module.exports一个对象，设置选项 runtinmeCompiler: true; 即可*

#### task2-18：vueRouter -- VueRouter-router-view

router-view 组件的功能是为了获取当前路由对应的组件并渲染，即：

```

let self = this; // 此时要用到 VueRouter 的this
Vue.component('router-view', {
	render(h){
		const cm = self.routeMap[self.data.current];
		return h(cm)
	}
})
```

router-link 组件的超链接 a 标签的默认行为是会跳转并请求接口刷新浏览器，但实际我们并不需要，所以，需要修改 router-link 组件中 a 标签的默认行为，并设计click事件逻辑：

```
Vue.components('router-link', {
	
	props: {
		to: String
	},
	
	render(h){
		return h('a', {
			attrs: {
				href: this.to
			},
			on: {
				click: this. clickHandler
			}
		},[this.$slots.default])
	},
	methods: {
		// 点击事件需要把地址栏中的地址改为接收到的地址
		// 并把新的地址更新到 data 里的 current，因为data里的值是响应式的，所以视图会跟着地址改变
		clickHandler(e){
			history.pushState({}, '', this.to);
			this.$router.data.current = this.to;
			e.preventDefault();
		}
	}

})

```
#### task2-19：vueRouter -- initEvent

由于在点击浏览器的前进和后退按钮时并没有触发改变 this.data.current 导致只有地址栏变化，视图并没有跟随变化，为 popState 添加事件监听,从而在浏览器触发 popState 时，触发监听事件，做相应操作：

```
initEvent(){
	window.addEventListener('popstate', ()=> {
		this.data.current = window.location.pathname
	})
}
```

initEvent 初始化监听方法在init()中进行调用：

```
init(){
	this.createRouteMap();
	this._initComponents();
	this,initEvent();
}
```


### Task3 模拟 vue.js 响应式原理
<hr/>

#### task3-1 课程目标

* 模拟一个最小版本的Vue
* 实际项目中出问题的原理层面解决
	* 给 Vue 实例新增一个成员是否是响应式的？
	* 给属性重新赋值成对象，是否是响应式的？

#### task3-2 数据驱动

* 数据响应式，双向绑定，数据驱动
* 数据响应式： 数据模型仅仅是普通的 javascript 对象，而当我们修改数据时，视图会进行更新，避免繁琐的 DOM 操作，提高开发效率
* 双向绑定
	* 数据改变，视图改变；视图改变，数据也随之改变
	* 使用 v-model 在表单元素上创建双向数据绑定
* 数据驱动是 Vue 最独特的特性之一： 开发过程中仅需关注数据本身，不需要关心数据是如何渲染到视图
	

#### task3-3 数据响应式核心原理-Vue2

如何追踪变化？Vue遍历data的所有属性，并使用 Object.defineProperty 把这些属性全部转化为 getter/setter，这些 getter/setter 让Vue能够追踪依赖，在属性被访问和修改时通知变更。

#### task3-4 数据响应式核心原理-Vue3

Vue3 中使用的是 new Proxy(obj1, obj2)

#### task3-5 发布订阅模式

发布订阅模式，首先先进行订阅（$.on('xx',()=>{})），并把这些订阅以键值对的形式存储起来，可以有多个键，每个键的值是一个数组，然后，发布者在发布时对指定的键的订阅者进行通知,即对指定的键进行循环调用。

```

// 事件触发器
class EventEmitter {
	constructor(){
		this.subs = Object.create(null)
	}
	
	$on (eventType,handler) {
		this.subs[eventType] = this.subs[eventType] || [];
		this.subs[eventType].push(handler)
	}
	
	$emit (eventType) {
		if(this.subs[eventType]){
			this.subs[eventType].forEach(handler => {
				handler();
			})
		}

	}
}

// 模拟测试

let em = new EventEmitter();

em.$on('click', ()=> {
	console.log('click1')
})

em.$on('click', ()=> {
	console.log('click2')
})

em.$emit('click')

```

#### task3-6 观察者模式

* 观察者（订阅者）-- watcher
	* update():当事件发生时，具体要做的事情
* 目标（发布者） -- Dep
	* subs 数组：存储所有的观察者
	* addSubs(): 添加观察者
	* notify(): 当事件发生时，调用所有观察者的 updatea() 方法
* 没有事件中心



```
// 目标（发布者）
class Dep {
	
	constructor(){
		this.subs = []
	}
	
	addSub (sub) {
		if (sub && sub.update) {
			this.subs.push(sub)
		}
	}
	
	notify () {
		this.subs.forEach(sub => {
			sub.update();
		})
	}

}

// 观察者（订阅者）
class Watcher {

	update () {
		console.log('update')
	}
}


// 模拟测试

let dep = new Dep();

let watcher = new Watcher();

dep.addSub(watcher);

dep.notify();


```

#### task3-7 模拟Vue响应式原理-分析

基本结构：

* Vue: 把data中的成员注入到Vue实例，并且把 data 中的成员转成 getter/setter
* Observer: 能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知 Dep
* Compiler: 解析每个元素中的指令/插值表达式，并替换成相应的数据
* Dep: 添加观察者，当数据变化时通知所有观察者
* Watcher: 数据变化更新视图

#### task3-8 Vue

功能：

* 负责接收初始化的参数（选项）
* 负责把data中的属性注入到Vue实例，转换成 getter/setter
* 负责调用 observer 监听 data 中所有属性的变化
* 负责调用 compiler 解析指令/插值表达式

代码如下：

```
class Vue {

	constructor (options) {
		// 1、保存选项数据
		this.$options = options || {}
		this.$data = options.data || {}
		const el = options.el
		this.$el = typeof options.el === 'string' ? document.querySelector(el) : el
		
		// 2、负责把 data 注入到 vue 实例
		this._proxyData(this.$data)
		
		// 3、负责调用 observer 实现数据劫持
		
		// 4、负责调用 Compiler 解析指令/插值表达式等
		
	}
	
	_proxyData(data){
		// 遍历data中的所有属性
		object.keys(data).forEach(key => {
			object.defineProperty(this, key, {
				get() {
					return data[key]
				},
				set(newValue){
					if (data[key] === newValue) {
						return
					}
					
					data[key] = newValue
				}
			
			})
		})
	}

}

```

#### task3-9 Observer

功能：

* 负责把 data 选项中的属性转换成响应式数据
* data 中的某个属性也是对象，把该属性转换成响应式数据
* 数据变化发送通知

结构：

* walk(data)
* defineReactive(data, key, value)

代码：

```
class observer {

	constructor(data){
		this.walk(data)
	}

	walk(data){
		if (!data || typeof data !== 'object') {
			return
		}
		Object.keys(data).forEach(key => {
			this.defineReactive(data, key, data[key])
		})
	}
	
	defineReactive(data, key, value){
	
		let that = this;
		
		// 如果 value 是对象，继续设置它下面的成员为响应式数据
		this.walk(value);
		
		Object.defineProperty(data, key, {
			configurable: true,
			enumberable: true,
			get () {
				return value
			},
			
			set(newValue){
				if (newValue === value) {
					return
				}
				
				// 如果 newValue 是对象，设置 newValue 的成员为响应式
				that.walk(newValue)
				value = newValue;
				
			}
		})
	}

}

```

#### task3-12 Compiler

功能：

* 负责编译模版，解析指令/插值表达式
* 负责页面的首次渲染
* 当数据变化后重新渲染

结构：

* el
* vm
* compile(el)
* compileElement(node)
* compileText(node)
* isDirective(attrName)
* isTextNode(node)
* isElementNode(node)

代码：

```
// 负责解析指令/插值表达式

class Compiler {

	constructor (vm) {
		this.vm = vm
		this.el = vm.$el
	}
	
	// 处理文本节点和元素节点
	compile(el){
		const nodes = el.childNodes;
		Array.from(nodes).forEach(node => {
			// 判断是文本节点还是元素节点
			if (this.isTextNode(node)) {
				this.compileText(node)
			} else if (this.isElementNode(node)) {
				this.compileElement(node)
			}
			
			if (node.childNodes && node.childNodes.length) {
				// 如果当前节点还有子节点，递归调用编译
				this.compile(node)
			}
		})
	}

	// 编译文本节点
	compileText(node){
		// {{ msg }} 形如这样的文本节点
		// 正则判断
		const reg = /\{\{(.+)\}\}/;
		// 获取文本节点内容
		const value = node.textContent
		if (reg.test(value)) {
			const key = RegExp.$1.trim() // 获取匹配到的第一个分组的内容
			node.textContent = value.replace(reg, this.vm[key])
		}
	}
	
	// 编译属性节点
	compileElement(node) {
		 // node.attributes
		 // 遍历所有属性节点
		 Array.from(node.attributes).forEach(attr => {
		 	let attrName = attr.name;
		 	// 判断节点的名称是不是指令
		 	if (this.isDirective(attrName)) {
		 		attrName = attrName.sunstr(2)
		 		let key = attr.value;
		 		this.update(node, key, attrName)
		 	}
		 })
		 // 判断是否是指令
	}
	
	// 处理
	update (node, key, attrName) {
		let updateFn = this[attrName + 'Updater'];
		updateFn && updateFn(node, this.vm[key])
	}
	
	// 处理 v-text 命令
	textUpdater(node, value){
		node.textContent = value;
	}
		
	// 处理 v-model 命令
	modelUpdater(node, value){
		node.value = value
	}
	
	// 判断是否是文本节点
	isTextNode(node){
		return node.nodeType === 3
	}
	
	// 判断是否是元素节点
	isElementNode(node){
		return node.nodeType === 1
	}
	
	// 判断是否是以 v- 开头的指令
	isDirective(attrName){
		return attrName.startsWith('v-')
	}
	
}

```

#### task3-16 Compiler复习

#### task3-17 Dep

功能: 

* 收集依赖，添加观察者（watcher）
* 通知所有观察者

结构：

* subs 
* addSub(sub)
* notify()

代码： 

```
class Dep {
	constructor() {
		this.subs = []
	}
	
	// 添加观察者
	addSubs(sub){
		if(sub && sub.update){
			this.subs.push(sub)
		}
	}
	
	// 通知所有观察者
	notify(){
		this.subs.forEach(sub => {
			sub.update()
		})
	}
}

```

在 compiler.js 中收集依赖，发送通知

```
// 在defineReactive中创建 dep 对象并收集依赖

const dep = new Dep();

// 在 getter 中 get的过程收集依赖
Dep.target && dep.addSubs(Dep.target)

// 在setter 中，当数据变化之后，发送通知
dep.notify()

```


#### task3-18 Watcher

 功能：
 
 * 当数据发生变化时，dep 通知所有的 watcher 实例更新视图
 * 自身实例化的时候在 dep 对象中添加自己，即：Dep.targrt = this

结构：
 
 * vm
 * key
 * cb
 * oldValue
 * update

 代码：
 
 ```
 class Watcher {
 
 	constructor(vm, key, cb) {
 		this.vm = vm
 		// data 中的属性名称
 		this.key = key
 		// 当数据变化时，调用 cb 更新视图
 		this.cb = cb
 		
 		// 在 Dep 的静态属性上记录当前 watcher 对象，当访问数据的时候把 watcher 添加到 dep 的subs 中
 		Dep.target = this
 		
 		// 调用vm[key]就会触发一次 getter ，即，会记录当前key的 watcher
 		this.oldValue = wm[key]
 		
 		// 清空target
 		Dep.target = null
 	}
 	
 	update(){
 		const newValue = this.vm[this.key]
 		
 		if(this.oldValue === newValue) {
 			return
 		}
 		
 		this.cb(newValue)
 	}
 	
 }
 
 ```

#### task3-19 创建Watcher对象1

在 compiler.js 中为每一个指令/插值表达式创建 watcher 对象，监视数据的变化

```
// 因为在textUpdater方法中要使用this
updaterFn && updaterFn.call(this,node, this.vm[key], key)

// v-text 指令的更新方法
textUpdater (node, value, key) {
	node.textContent = value;
	
	new Watcher(this.vm, key, value => {
		node.textContent = value
	})
}


// v-model 指令的更新方法
modelUpdater (node, value, key) {
	node.value = value;
	
	new Watcher(this.vm, key, value => {
		node.value = value
	})
}

```

#### task3-21 双向绑定

```

// v-model 指令的更新方法
modelUpdater (node, value, key) {
	node.value = value;
	
	new Watcher(this.vm, key, value => {
		node.value = value
	})
	
	node.addEventListener('input', () => {
		// 当给 vm[key] 赋值是会触发响应式机制，达到数据 视图 同步更新
		this.vm[key] = node.value
	})
}

```


### Task4 Virtual DOM 的实现原理
<hr/>

#### task4-2 什么是虚拟 DOM 

由普通的 JS 对象来描述 DOM 对象，因为不是真实的 DOM 对象，所以叫 Virtual DOM

可以使用 Virtual DOM 来描述真实 DOM，例如：

```
{ 
	sel: "div",
	data: {},
	children: undefined,
	text: "Hello Virtual DOM",
	elm: undefined,
	key: undefined
}
```

#### task4-3 为什么使用虚拟 DOM 

* 手动操作DOM比较麻烦，还需要考虑浏览器的兼容性问题，虽然有jQuery等库简化DOM操作，但是随着项目的复杂 DOM 操作复杂提升
* 为了简化DOM的复杂操作于是出现了各种MVVM框架，MVVM框架解决了视图和状态的同步问题
* 为了简化视图的操作我们可以使用模版引擎，但是模版引擎没有解决跟踪状态变化的问题，于是 Virtual DOM 出现了
* Virtual DOM 的好处是当状态改变时不需要立即更新DOM，只需要创建一个虚拟树来描述DOM，Virtual DOM 内部将弄清楚如何有效（diff）的更新DOM

*虚拟DOM的描述：*
*虚拟DOM可以维护程序的状态，跟踪上一次的状态*
*通过比较前后两次状态的差异更新真实DOM*


#### task4-4 虚拟DOM的作用和虚拟DOM库

作用：

* 维护视图和状态的关系
* 复杂视图情况下提升渲染性能
* 除了渲染DOM以外，还可以实现 SSR（Nuxt.js/Next.js）/原声应用（Weex/React Native）、小程序（mpvue/uni-app）等

虚拟DOM库

* Snabbdom
* virtual-dom

#### task4-5 创建项目

#### task4-6 导入 Snabbdom

导入有两种方式：

* commonJs 的 require 进行导入
* ES6 的 import 导入，需要注意，使用import导入时，需要使用{}花括号，因为snabbdom在导出时没有使用default

#### task4-7 代码演示

事例1:

```
import {h, init } from "snabbdom";

// patch函数，作用是对比两个Vnode 的差异更新到真实DOM
let patch = init([])

// h函数，第一个参数：标签+选择器；第二个参数：如果是字符串就是标签中的内容;最终返回vnode
let vnode = h('div#app', 'hello world')

let app = document.querySelector('#app')

// patch函数，第一个参数：可以是DOM元素，内部会把DOM元素转换成VNode
// 第二个参数：VNode
// 返回值：VNode
let oldVnode = patch(app, vnode)

// 假设要重新渲染显示的内容
vnode = h('div', 'hello snabbdom lucky!')

patch(oldVnode, vnode)


```

事例2:

```
import { h, init } from 'snabbdom';

let patch = init([]);

let app = document.querySelector('#app');

let vnode = h('div#container', [
	h('h1', 'hello 我是标题'),
	h('p', 'hi 我是内容')
])

let oldVnode = patch(app, vnode);

setTimeOut(()=>{
	let vnode = h('div#container',[
		h('h1', '你好，我是标题'),
		h('p', '你好，我是内容')
	])
	
	patch(oldVnode, vnode)
	
	// 清空内容的写法
	// patch(oldVnode, h('!'))

},2000)

```

#### task4-8 模块

官方提供6个常用模块

* attributes: 设置DOM元素的属性，处理布尔类型的属性
* peops:和attributes相似，设置DOM元素的属性，不处理布尔类型的属性
* style：设置行内样式，支持动画
* class：切换类样式，给元素设置类样式通过 sel 选择器
* dataset：设置 data-* 的自定义属性
* eventlisteners:注册和移除事件

模块使用步骤：

* 1、导入所需要的模块，例如： import style from 'snabbdom/modules/style'
* 2、注册模块，在init时，传入模块名称，例如：init([style, eventlisteners])
* 3、使用模块，在使用 h() 函数的第二个参数出入模块需要的数据（对象），例如：

```
let vnode = h('div', {
	style: {
		background: 'blue'
	},
	on: {
		click: eventHandler
	}
},[
	h('h1', '标题'),
	h('p', '内容')
])

function eventHandler(){
	console.log('这是一个点击事件')
}

```

#### task4-9 Snabbdom源码分析

如何学习源码：宏观了解，带着目标看源码，不求甚解，参考资料

源码地址：https://github.com/snabbdom/snabbdom

Snabbdom的核心：

* 使用h()函数创建Javascript对象(vnode)描述真实DOM 
* init()设置模块，创建patch()
* patch()比较新旧两个vnode
* 把变化的内容更新到真实的DOM树上

源码重点学习：

* h.ts: h()函数，用来创建vnode
* snabbdom.ts：初始化，返回init/h/thunk
* vnode.ts：虚拟节点定义

#### task4-10 Snabbdom--h函数

h() 函数就是调用 vnode()  函数返回虚拟节点

看源码常用快捷键：

ALT + <- 回到上一个位置

Ctrl + 单机鼠标左键 或者 F12 快速定位指定方法定义位置












