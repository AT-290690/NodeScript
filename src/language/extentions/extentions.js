import { CodeMirror } from '../../editor/cell.editor.bundle.js'
import { toJavasScript } from '../core/toJs.js'
import { VOID } from '../core/tokens.js'
import { removeNoCode, wrapInBody } from '../core/utils.js'
export const consoleElement = document.getElementById('console')
const canvasContainer = document.getElementById('canvas-container')
export const popupContainer = document.getElementById('popup-container')

const createPopUp = () => {
  popupContainer.innerHTML = ''
  const popup = CodeMirror(popupContainer)
  popupContainer.style.display = 'block'
  return popup
}

const popUp = (
  popup,
  msg,
  w = window.innerWidth / 2 - 5,
  h = window.innerHeight / 3,
) => {
  popup.setSize(w, h)
  popup.setValue(msg)
}
const prefixDep = (dep, prefix = '') =>
  Object.entries(dep).reduce((acc, [key, value]) => {
    if (!acc[prefix]) acc[prefix] = {}
    acc[prefix][key] = value
    return acc
  }, {})
export const print = function (...values) {
  if (values.length === 0) return VOID
  values.forEach(
    x => (consoleElement.value += `[ ${JSON.stringify(x) ?? undefined} ]`),
  )
  return values
}

export const protolessModule = methods => {
  const env = Object.create(null)
  for (const method in methods) env[method] = methods[method]
  return env
}

export class StandartLibrary {
  NAME = 'LIBRARY'
  COLOR = {
    NAME: 'COLOR',
    makergbcolor: (r, g, b) => {
      return `rgb(${r}, ${g}, ${b})`
    },
    makergbalphacolor: (r, g, b, a = 1) => {
      return `rgba(${r}, ${g}, ${b}, ${a})`
    },
    randomcolor: () => {
      return `#${Math.floor(Math.random() * 16777215).toString(16)}`
    },
    randomlightcolor: () => {
      return (
        '#' +
        (
          '00000' + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)
        ).slice(-6)
      )
    },
    rgbtohex: color => {
      const [r, g, b] = color.split('(')[1].split(')')[0].split(',').map(Number)
      function componentToHex(c) {
        var hex = c.toString(16)
        return hex.length == 1 ? '0' + hex : hex
      }

      return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
    },
    inverthexcolor: hex => {
      return (
        '#' +
        (Number(`0x1${hex.split('#')[1]}`) ^ 0xffffff)
          .toString(16)
          .substr(1)
          .toUpperCase()
      )
    },
  }
  SKETCH = {
    NAME: 'SKETCH',
    VECTOR: {
      NAME: 'VECTOR',
      makevector: (...args) => {
        return new Two.Vector(...args)
      },
      zero: Two.Vector.zero,
      left: Two.Vector.left,
      right: Two.Vector.right,
      up: Two.Vector.up,
      down: Two.Vector.down,
      add: (a, b) => {
        return Two.Vector.add(a, b)
      },
      subtract: (a, b) => {
        return Two.Vector.subtract(a, b)
      },
      multiply: (a, b) => {
        return Two.Vector.add(a, b)
      },
      divide: (a, b) => {
        return a.divide(b)
      },
      dot: (a, b) => {
        return a.dot(b)
      },
      normalize: vec => {
        return vec.normalize()
      },
      ratiobetween: (a, b) => {
        return Two.Vector.ratioBetween(a, b)
      },
      anglebetween: (a, b) => {
        return Two.Vector.angleBetween(a, b)
      },
      distancebetween: (a, b) => {
        return Two.Vector.distanceBetween(a, b)
      },
      distancebetweensquared: (a, b) => {
        return Two.Vector.distanceBetweenSquared(a, b)
      },
      distanceto: (a, b, e) => {
        return a.distanceTo(b, e)
      },
      distancetosquared: (a, b, e) => {
        return a.distanceToSquared(b, e)
      },
      getx: vec => {
        return vec.x
      },
      gety: vec => {
        return vec.y
      },
      copy: (vec, d) => {
        return vec.copy(d)
      },
      clear: vec => {
        return vec.clear()
      },
      clone: vec => {
        return vec.clone()
      },
      lerp: (vec, d, t) => {
        return vec.lerp(d, t)
      },
      addself: (vec, a) => {
        return vec.addSelf(a)
      },
      subtractself: (vec, a) => {
        return vec.subtractSelf(a)
      },
      multiplyself: (vec, a) => {
        return vec.multiplySelf(a)
      },
      multiplyscalar: (vec, scalar) => {
        return vec.multiplyScalar(scalar)
      },
      dividescalar: (vec, scalar) => {
        return vec.divideScalar(scalar)
      },
      setlength: (vec, len) => {
        return vec.setLength(len)
      },
      length: vec => {
        return vec.length()
      },
      rotate: (vec, angle) => {
        return vec.rotate(angle)
      },
    },
    background: (color = 'var(--background-primary)') => {
      return (canvasContainer.firstChild.style.background = color)
    },
    requestanimationframe: fn => {
      return (animation = requestAnimationFrame(fn))
    },
    destroycomposition: () => {
      canvasContainer.style.background = 'var(--background-primary)'
      canvasContainer.innerHTML = ''
      this.SKETCH.engine?.removeEventListener('update')
    },
    makescene: (width = 100, height = 100, callback) => {
      canvasContainer.innerHTML = ''
      this.SKETCH.engine?.removeEventListener('update')
      // this.SKETCH.engine?.removeEventListener('update');
      // window.removeEventListener('keydown', events.events['keydown']);
      this.SKETCH.engine = new Two({
        width,
        height,
      }).appendTo(canvasContainer)
      callback()
      return 'Scene created!'
    },
    insertintogroup: (group, ...items) => {
      group.add(...items)
      return group
    },
    insertintogroupbypartitions: (group, ...partitions) => {
      partitions.forEach(items => group.add(...items))
      return group
    },
    removefromgroup: item => {
      item.parent.remove(item)
      this.SKETCH.engine.add(item)
      return item
    },
    removefromscene: item => {
      item.remove()
      return VOID
    },
    groupadditions: group => {
      return group.additions
    },
    groupchildren: group => {
      return group.children
    },
    width: (ratio = 1) => {
      return this.SKETCH.engine.width * ratio
    },
    height: (ratio = 1) => {
      return this.SKETCH.engine.height * ratio
    },
    add: (...elements) => {
      return this.SKETCH.engine.add(...elements)
    },
    clear: () => {
      return this.SKETCH.engine.clear()
    },
    ignore: (...args) => {
      return this.SKETCH.engine.ignore(...args)
    },
    interpret: index => {
      return this.SKETCH.engine.interpret(document.getElementById(index))
    },
    listen: (...args) => {
      return this.SKETCH.engine.listen(...args)
    },
    load: (...args) => {
      return this.SKETCH.engine.load(...args)
    },
    makearcsegment: (...args) => {
      return this.SKETCH.engine.makeArcSegment(...args)
    },
    makearrow: (...args) => {
      return this.SKETCH.engine.makeArrow(...args)
    },
    makecircle: (x, y, r) => {
      return this.SKETCH.engine.makeCircle(x, y, r)
    },
    makecurve: (...points) => {
      return this.SKETCH.engine.makeCurve(...points)
    },
    makeellipse: (...args) => {
      return this.SKETCH.engine.makeEllipse(...args)
    },
    makegroup: (...args) => {
      return this.SKETCH.engine.makeGroup(...args)
    },
    makeimagesequence: (...args) =>
      this.SKETCH.engine.makeImageSequence(...args),
    makeline: (x1, y1, x2, y2, color = 'white') => {
      const line = this.SKETCH.engine.makeLine(x1, y1, x2, y2)
      line.stroke = color
      return line
    },
    makelineargradient: (...args) => {
      return this.SKETCH.engine.makeLinearGradient(...args)
    },
    makepath: (...args) => {
      return this.SKETCH.engine.makePath(...args)
    },
    makepoints: (...args) => {
      return this.SKETCH.engine.makePoints(...args)
    },
    makepolygon: (...args) => {
      return this.SKETCH.engine.makePolygon(...args)
    },
    makeradialgradient: (...args) => {
      return this.SKETCH.engine.makeRadialGradient(...args)
    },
    makerectangle: (x, y, w, h) => {
      return this.SKETCH.engine.makeRectangle(x, y, w, h)
    },
    makeroundedrectangle: (...args) => {
      return this.SKETCH.engine.makeRoundedRectangle(...args)
    },
    makesprite: (...args) => {
      return this.SKETCH.engine.makeSprite(...args)
    },
    makestar: (...args) => {
      return this.SKETCH.engine.makeStar(...args)
    },
    maketext: (...args) => {
      return this.SKETCH.engine.makeText(...args)
    },
    maketexture: (...args) => {
      return this.SKETCH.engine.makeTexture(...args)
    },
    on: (...args) => {
      return this.SKETCH.engine.on(...args)
    },
    off: (...args) => {
      return this.SKETCH.engine.off(...args)
    },
    pause: (...args) => {
      this.SKETCH.engine.pause(...args)
      return 'Paused!'
    },
    play: (...args) => {
      this.SKETCH.engine.play(...args)
      return 'Playing!'
    },
    release: (...args) => {
      return this.SKETCH.engine.release(...args)
    },
    remove: (...args) => {
      return this.SKETCH.engine.remove(...args)
    },
    setplaying: (...args) => {
      return this.SKETCH.engine.setPlaying(...args)
    },
    trigger: (...args) => {
      return this.SKETCH.engine.trigger(...args)
    },
    update: (...args) => {
      this.SKETCH.engine.update(...args)
      return 'Updated!'
    },
    nofill: entity => {
      entity.noFill()
      return entity
    },
    nostroke: entity => {
      entity.noStroke()
      return entity
    },
    draw: (lifespan, callback) => {
      if (callback && typeof callback === 'function') {
        this.SKETCH.engine.bind('update', callback)
        setTimeout(() => {
          this.SKETCH.engine.unbind('update', callback)
          this.SKETCH.engine.removeEventListener('update')
        }, 1000 * lifespan)
      }
    },

    setscreensize: (w, h, showBorder = true) => {
      const svg = canvasContainer.firstChild
      svg.setAttribute('width', w)
      svg.setAttribute('height', h)
      if (showBorder) svg.style.border = '1px solid lime'
    },
    setoffsetstart: entity => {
      entity.position.x = entity.position.x + entity.width * 0.5
      entity.position.y = entity.position.y + entity.height * 0.5
      return entity
    },
    setfill: (entity, fill) => {
      entity.fill = fill
      return entity
    },
    setstroke: (entity, stroke) => {
      entity.stroke = stroke
      return entity
    },
    setdashes: (entity, dashes) => {
      entity.dashes = dashes
      return entity
    },
    setlinewidth: (entity, linewidth) => {
      entity.linewidth = linewidth
      return entity
    },
    offsetby: (entity, x, y) => {
      entity.additions
        ? entity.additions.forEach(item => {
            item.position.set(item.position.x - x, item.position.y - y)
          })
        : entity.origin.set(x, y)

      entity.position.set(x, y)
      return entity
    },
    setposition: (entity, x, y) => {
      entity.position.set(x, y)
      return entity
    },
    setpositionx: (entity, x) => {
      entity.position.x = x
      return entity
    },
    setpositiony: (entity, y) => {
      entity.position.y = y
      return entity
    },
    setscale: (entity, s) => {
      entity.scale = s
      return entity
    },
    setopacity: (entity, opacity) => {
      entity.opacity = opacity
      return entity
    },
    setrotation: (entity, a) => {
      entity.rotation = a
      return entity
    },
    setwidth: (entity, w) => {
      entity.width = w
      return entity
    },
    setheight: (entity, h) => {
      entity.height = h
      return entity
    },
    setorigin: (entity, x, y) => {
      entity.additions
        ? entity.additions.forEach(item => {
            item.position.set(item.position.x - x, item.position.y - y)
          })
        : entity.origin.set(x, y)
      return entity
    },
    make: (prop, ...args) => {
      return new Two[prop](...args)
    },
    getwidth: () => {
      return document.body.getBoundingClientRect().width
    },
    getheight: () => {
      return document.body.getBoundingClientRect().height
    },
    getfromgroup: (group, index) => {
      return group.additions[index]
    },
    getorigin: entity => {
      return entity.origin
    },
    getopacity: entity => {
      return entity.opacity
    },
    getdashes: entity => {
      return entity.dashes
    },
    getposition: entity => {
      return entity.position
    },
    gettranslation: entity => {
      return entity.translation
    },
    getbounds: entity => {
      return entity.getBoundingClientRect()
    },
  }
  OBJECT = {
    NAME: 'OBJECT',
    forin: (object, callback) => {
      for (const key in object) callback(key, object)
      return object
    },
    forof: (object, callback) => {
      for (const key in object) callback(object[key])
      return object
    },
    jsonstring: object => {
      return JSON.stringify(object)
    },
    jsonparse: string => {
      return JSON.parse(string)
    },
    clone: obj => {
      return structuredClone(obj)
    },
    has: (obj, ...props) => {
      return +props.every(x => x in obj)
    },
    keys: obj => {
      return Object.keys(obj)
    },
    values: obj => {
      return Object.values(obj)
    },
    entries: obj => {
      return Object.entries(obj)
    },
    fromentries: entries => {
      return Object.fromEntries(entries)
    },
    freeze: obj => {
      void Object.freeze(obj)
      return obj
    },
    size: obj => {
      return Object.keys(obj).length
    },
  }
  MATH = {
    NAME: 'MATH',
    abs: num => {
      return Math.abs(num)
    },
    mod: (left, right) => {
      return ((left % right) + right) % right
    },
    clamp: (num, min, max) => {
      return Math.min(Math.max(num, min), max)
    },
    sqrt: num => {
      return Math.sqrt(num)
    },
    inc: (a, i = 1) => {
      return (a += i)
    },
    add: (a, b) => {
      return a + b
    },
    sub: (a, b) => {
      return a - b
    },
    mult: (a, b) => {
      return a * b
    },
    pow: (a, b) => {
      return a ** b
    },
    pow2: a => {
      return a ** 2
    },
    divide: (a, b) => {
      return a / b
    },
    sign: n => {
      return Math.sign(n)
    },
    trunc: n => {
      return Math.trunc(n)
    },
    exp: n => {
      return Math.exp(n)
    },
    floor: n => {
      return Math.floor(n)
    },
    round: n => {
      return Math.round(n)
    },
    random: () => {
      return Math.random()
    },
    dice: (min, max) => {
      return Math.floor(Math.random() * (max - min + 1) + min)
    },
    rolldice: (min, max) => {
      return Math.floor(Math.random() * (max - min + 1) + min)
    },
    max: (...args) => {
      return Math.max(...args)
    },
    min: (...args) => {
      return Math.min(...args)
    },
    sin: n => {
      return Math.sin(n)
    },
    cos: n => {
      return Math.cos(n)
    },
    tan: n => {
      return Math.tan(n)
    },
    atan: n => {
      return Math.atan(n)
    },
    atan2: (y, x) => {
      return Math.atan2(y, x)
    },
    log10: x => {
      return Math.log10(x)
    },
    log2: x => {
      return Math.log2(x)
    },
    log: x => {
      return Math.log(x)
    },
    sum: arr => {
      return arr.reduce((acc, item) => (acc += item), 0)
    },
    MININT: Number.MINSAFEINTEGER,
    MAXINT: Number.MAXSAFEINTEGER,
    infinity: Number.POSITIVEINFINITY,
    negative: n => {
      return -n
    },
    PI: Math.PI,
    parseint: (number, base) => {
      return parseInt(number.toString(), base)
    },
    number: string => {
      return Number(string)
    },
  }
  STRING = {
    NAME: 'STRING',
    interpolate: (...args) => {
      return args.reduce((acc, item) => {
        return (acc += item.toString())
      }, '')
    },
    includes: (string, target) => {
      return string.includes(target)
    },
    string: thing => {
      return thing.toString()
    },
    uppercase: string => {
      return string.toUpperCase()
    },
    lowercase: string => {
      return string.toLowerCase()
    },
    trim: string => {
      return string.trim()
    },
    trimstart: string => {
      return string.trimStart()
    },
    trimend: string => {
      return string.trimEnd()
    },
    substring: (string, start, end) => {
      return string.substring(start, end ?? end.length)
    },
    replace: (string, match, replace) => {
      return string.replace(match, replace)
    },
    sp: ' ',
  }
  CONVERT = {
    NAME: 'CONVERT',
    array: thing => [...thing],
    boolean: thing => {
      return Boolean(thing)
    },
    string: thing => {
      return thing.toString()
    },
    integer: number => {
      return parseInt(number.toString())
    },
    float: (number, base = 1) => {
      return +Number(number).toFixed(base)
    },
    number: thing => {
      return Number(thing)
    },
  }
  CONSOLE = {
    print,
    printlog: thing => {
      return console.log(...print(thing))
    },
    consolelog: thing => {
      return console.log(thing)
    },
    NAME: 'CONSOLE',
  }
  LOGIC = {
    NAME: 'LOGIC',
    istrue: bol => {
      return +(!!bol === true)
    },
    isfalse: bol => {
      return +(!!bol === false)
    },
    isequal: (a, b) => {
      const typeA = typeof a,
        typeB = typeof b
      if (typeA !== typeB) return 0
      if (typeA === 'number' || typeA === 'string' || typeA === 'boolean') {
        return +(a === b)
      }
      if (typeA === 'object') {
        const isArrayA = Array.isArray(a),
          isArrayB = Array.isArray(b)
        if (isArrayA !== isArrayB) return 0
        if (isArrayA && isArrayB) {
          if (a.length !== b.length) return 0
          return +a.every((item, index) => this.LOGIC.isequal(item, b[index]))
        } else {
          if (a === undefined || a === null || b === undefined || b === null)
            return +(a === b)
          if (Object.keys(a).length !== Object.keys(b).length) return 0
          for (const key in a) {
            if (!this.LOGIC.isequal(a[key], b[key])) {
              return 0
            }
          }
          return 1
        }
      }
    },
    issimilar: (a, b) => {
      const typeA = typeof a,
        typeB = typeof b
      if (typeA !== typeB) return 0
      if (typeA === 'number' || typeA === 'string' || typeA === 'boolean') {
        return +(a === b)
      }
      if (typeA === 'object') {
        const isArrayA = Array.isArray(a),
          isArrayB = Array.isArray(b)
        if (isArrayA !== isArrayB) return 0
        if (isArrayA && isArrayB) {
          return a.length < b.length
            ? +a.every((item, index) => this.LOGIC.issimilar(item, b[index]))
            : +b.every((item, index) => this.LOGIC.issimilar(item, a[index]))
        } else {
          if (a === undefined || a === null || b === undefined || b === null)
            return +(a === b)
          const less = Object.keys(a) > Object.keys(b) ? b : a
          for (const key in less) {
            if (!this.LOGIC.issimilar(a[key], b[key])) {
              return 0
            }
          }
          return 1
        }
      }
    },
    isnotvoid: item => {
      return item === VOID ? 0 : 1
    },
    isvoid: item => {
      return item === VOID ? 1 : 0
    },
    makeboolean: item => {
      return Boolean(item)
    },
    and: (entity, other) => {
      return entity && other
    },
    or: (entity, other) => {
      return entity || other
    },
    isempty: item => {
      return Object.keys(item).length === 0 ? 1 : 0
    },
    TRUE: 1,
    FALSE: 0,
    iseven: arg => {
      return arg % 2 === 0 ? 1 : 0
    },
    isodd: arg => {
      return arg % 2 !== 0 ? 1 : 0
    },
    invert: val => {
      return +!val
    },
    ishaving: (obj, ...props) => {
      return +props.every(x => x in obj)
    },
    areequal: (item, ...args) => {
      return +args.every(current => this.LOGIC.isequal(item, current))
    },
  }
  LOOP = {
    NAME: 'LOOP',
    generator: (entity = [], index = 0) => {
      return function* () {
        while (true) {
          yield entity[index++]
        }
      }
    },
    counter: (index = 0) => {
      return function* () {
        while (true) {
          yield index++
        }
      }
    },
    next: entity => {
      return entity.next().value
    },
    iterate: (iterable, callback) => {
      for (const i in iterable) {
        callback(i, iterable)
      }
      return iterable
    },
    inside: (iterable, callback) => {
      for (const i in iterable) {
        callback(i)
      }
      return iterable
    },
    forofevery: (iterable, callback) => {
      for (const x of iterable) {
        callback(x)
      }
      return iterable
    },
    routine: (entity, times, callback) => {
      let out = VOID
      for (let i = 0; i < times; i++) out = callback(entity, i)
      return out
    },
    loop: (start, end, callback) => {
      for (let i = start; i < end; i++) callback(i)
    },
    whiletrue: (condition, callback) => {
      let out = VOID
      while (condition()) out = callback()
      return out
    },
    repeat: (times, callback) => {
      let out = VOID
      for (let i = 0; i < times; i++) out = callback(i)
      return out
    },
    tailcalloptimisedrecursion:
      func =>
      (...args) => {
        let result = func(...args)
        while (typeof result === 'function') result = result()
        return result
      },
  }
  ARRAY = {
    NAME: 'ARRAY',
    ['map1']: (entity, callback) => {
      return entity.map(x => callback(x))
    },
    ['filter1']: (entity, callback) => {
      return entity.filter(x => callback(x))
    },
    ['fold1']: (entity, callback) => {
      return entity.reduce(acc => callback(acc), [])
    },
    ['fold2']: (entity, callback) => {
      return entity.reduce((acc, item) => callback(acc, item), [])
    },
    ['fold3']: (entity, callback) => {
      return entity.reduce((acc, item, index) => callback(acc, item, index), [])
    },
    ['reduce1']: (entity, callback, acc) => {
      return entity.reduce(acc => callback(acc), acc)
    },
    ['reduce2']: (entity, callback, acc) => {
      return entity.reduce((acc, x) => callback(acc, x), acc)
    },
    ['find1']: (entity, callback) => {
      return entity.find(x => callback(x))
    },
    ['some1']: (entity, callback) => {
      return entity.some(x => callback(x))
    },
    ['every1']: (entity, callback) => {
      return entity.every(x => callback(x))
    },
    ['map3']: (entity, callback) => {
      return entity.map((x, i, a) => callback(x, i, a))
    },
    ['filter3']: (entity, callback) => {
      return entity.filter((x, i, a) => callback(x, i, a))
    },
    ['reduce3']: (entity, callback, acc) => {
      return entity.reduce((acc, x, i, a) => callback(acc, x, i, a), acc)
    },
    ['find3']: (entity, callback) => {
      return entity.find((x, i, a) => callback(x, i, a))
    },
    ['some3']: (entity, callback) => {
      return entity.some((x, i, a) => callback(x, i, a))
    },
    ['every3']: (entity, callback) => {
      return entity.every((x, i, a) => callback(x, i, a))
    },
    ['foreach1']: (entity, callback) => {
      entity.forEach(x => callback(x))
      return entity
    },
    ['foreach2']: (entity, callback) => {
      entity.forEach((x, i) => callback(x, i))
      return entity
    },
    compact: arr => {
      return arr.filter(Boolean)
    },
    makearray: (...items) => {
      return items
    },
    makematrix: (...dimensions) => {
      if (dimensions.length > 0) {
        const dim = dimensions[0]
        const rest = dimensions.slice(1)
        const arr = []
        for (let i = 0; i < dim; i++) arr[i] = this.ARRAY.makematrix(...rest)
        return arr
      } else return VOID
    },
    unique: entity => {
      const set = new Set()
      return entity.reduce((acc, item) => {
        if (!set.has(item)) {
          set.add(item)
          acc.push(item)
        }
        return acc
      }, [])
    },
    partition: (entity, groups = 1) => entity.partition(groups),
    indexediteration: (entity, fn) => {
      return entity.forEach((x, i, arr) => fn(i))
    },
    forof: (entity, fn) => {
      return entity.forEach((x, i, arr) => fn(x))
    },
    each: (entity, fn) => {
      return entity.forEach((x, i, arr) => fn(x, i))
    },
    from: items => {
      return Array.from(items)
    },
    transform: (entity, callback) => {
      for (let i = 0; i < entity.length; i++)
        entity[i] = callback(entity[i], i, entity)
      return entity
    },
    tail: entity => {
      entity.shift()
      return entity
    },
    head: entity => {
      entity.pop()
      return entity
    },
    map: (entity, callback) => {
      return entity.map(callback)
    },
    filter: (entity, callback) => {
      return entity.filter(callback)
    },
    reduce: (entity, callback, acc) => {
      return entity.reduce(callback, acc)
    },
    foreach: (entity, callback) => {
      return entity.forEach(callback)
    },
    reverse: entity => {
      return entity.reverse()
    },
    insertatend: (entity, ...args) => {
      entity.push(...args)
      return entity
    },
    removefromend: entity => {
      entity.pop()
      return entity
    },
    put: (entity, item) => {
      entity.push(item)
      return item
    },
    push: (entity, ...args) => {
      return entity.push(...args)
    },
    pop: entity => {
      return entity.pop()
    },
    prepend: (entity, item) => {
      entity.unshift(item)
      return entity
    },
    append: (entity, item) => {
      entity.push(item)
      return entity
    },
    tail: entity => {
      entity.pop()
      return entity
    },
    head: entity => {
      entity.shift()
      return entity
    },
    includes: (entity, arg) => {
      return +entity.includes(arg)
    },
    isarray: entity => {
      return +entity.isArray()
    },
    unshift: (entity, ...args) => {
      return entity.unshift(...args)
    },
    shift: entity => {
      return entity.shift()
    },
    fill: (entity, filling) => {
      return entity.fill(filling)
    },
    find: (entity, callback) => {
      return entity.find(callback)
    },
    findindex: (entity, callback) => {
      return entity.findIndex(callback)
    },
    indexof: (entity, item) => {
      return entity.indexOf(item)
    },
    some: (entity, callback) => {
      return +entity.some(callback)
    },
    every: (entity, callback) => {
      return +entity.every(callback)
    },
    split: (str, separator) => {
      return str.split(separator)
    },
    join: (entity, separator) => {
      return entity.join(separator)
    },
    flat: (entity, level) => {
      return entity.flat(level)
    },
    flatMap: (entity, callback) => {
      return entity.flatMap(callback)
    },
    sort: (entity, callback) => {
      return entity.sort(callback)
    },
    slice: (entity, start, end) => {
      return entity.slice(start, end)
    },
    splice: (entity, ...args) => {
      return entity.splice(...args)
    },
    range: (start, end, step = 1) => {
      const arr = []
      if (start > end) for (let i = start; i >= end; i -= 1) arr.push(i * step)
      else for (let i = start; i <= end; i += 1) arr.push(i * step)
      return arr
    },
    at: (entity, index) => {
      return entity.at(index)
    },
    first: entity => {
      return entity[0]
    },
    last: entity => {
      return entity[entity.length - 1]
    },
  }

  constructor() {
    this.COLOR.randomcolor.comment = 'Generate a random hex color'
  }
}

export const STD = {
  void: VOID,
  VOID,
  _: VOID,
  null: VOID,
  NULL: VOID,
  COMP: (...source) => {
    source = source
      .map((x, i) => (i % 2 !== 0 ? `"${x.replaceAll(';;', '')}"` : x))
      .join('')
    console.log(source)
    popUp(
      createPopUp(),
      toJavasScript({
        source: wrapInBody(removeNoCode(source)),
      }),
      window.innerWidth * 1 - 20,
      window.innerHeight / 2,
    )
  },
  IMP: module => {
    const pop = createPopUp()
    popUp(
      pop,
      `<- [${Object.keys(module)
        .filter(x => x !== 'NAME')
        .map(x => `"${x}"`)
        .join(';')}] [${module.NAME}];\n`,
      window.innerWidth * 1 - 20,
    )
    pop.focus()
  },
  SOURCE: method => {
    popUp(
      createPopUp(),
      method.toString(),
      window.innerWidth * 1 - 20,
      window.innerHeight / 2,
    )
  },
  INSPECT: (disable = 0) => {
    if (disable) return (msg, count) => {}
    const popup = createPopUp()
    popup.setSize(window.innerWidth * 1 - 20, window.innerHeight / 3)
    let count = 0
    return (msg, comment = '', space) => {
      const current = popup.getValue()
      popup.setValue(
        `${current ? current + '\n' : ''};; ${count++} ${comment}
${msg !== VOID ? JSON.stringify(msg, null, space) : VOID}`,
      )
      popup.setCursor(
        popup.posToOffset({ ch: 0, line: popup.lineCount() - 1 }),
        true,
      )
      return msg
    }
  },

  tco:
    func =>
    (...args) => {
      let result = func(...args)
      while (typeof result === 'function') result = result()
      return result
    },
  LIBRARY: new StandartLibrary(),
}
