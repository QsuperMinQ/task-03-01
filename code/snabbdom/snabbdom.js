import { h, init } from 'snabbdom'
import { classModule } from 'snabbdom/modules/class.js'
import { propsModule } from 'snabbdom/modules/props.js'
import { styleModule } from 'snabbdom/modules/style.js'
import { eventListenersModule } from 'snabbdom/modules/eventlisteners.js'

var patch = init([classModule, propsModule, styleModule, eventListenersModule])

var vnode
var nextKey = 6
var sortBy = 'rank'
var originalData = [
  { rank: 1, name: '小张', age: 13, score: 100 },
  { rank: 2, name: '小王', age: 11, score: 96 },
  { rank: 3, name: '小李', age: 12, score: 95 },
  { rank: 4, name: '小赵', age: 10, score: 94 },
  { rank: 5, name: '小孙', age: 14, score: 90 },
]
var data = [
  originalData[0],
  originalData[1],
  originalData[2],
  originalData[3],
  originalData[4]
]

function changeSort (prop) {
  sortBy = prop
  data.sort((a, b) => {
    if (a[prop] > b[prop]) {
      return 1
    }
    if (a[prop] < b[prop]) {
      return -1
    }
    return 0
  })
  render()
}

function add () {
  var n = originalData[Math.floor(Math.random() * 5)]
  data = [{ rank: nextKey++, name: n.name, age: n.age, score: n.score }].concat(data)
  render()
}

function remove (student) {
  data = data.filter((m) => {
    return m !== student
  })
  render()
}

function studentView (student) {
  return h('div.row', {
    key: student.rank
  }, [
    h('div', { style: { fontWeight: 'bold' } }, student.rank),
    h('div', student.name),
    h('div', student.age),
    h('div', student.score),
    h('div.btn.rm-btn', { on: { click: [remove, student] } }, 'x'),
  ])
}

function render () {
  vnode = patch(vnode, view(data))
}

function view (data) {
  return h('div', [
    h('h1', '学生信息排名'),
    h('div', [
      h('a.btn.add', { on: { click: add } }, 'Add'),
      '排名 by: ',
      h('span.btn-group', [
        h('a.btn.rank', { class: { active: sortBy === 'score' }, on: { click: [changeSort, 'score'] } }, '成绩'),
        h('a.btn.age', { class: { active: sortBy === 'age' }, on: { click: [changeSort, 'age'] } }, '年龄')
      ]),
    ]),
    h('div.list', data.map(studentView)),
  ])
}

window.addEventListener('DOMContentLoaded', () => {
  var container = document.getElementById('app')
  vnode = patch(container, view(data))
  render()
})