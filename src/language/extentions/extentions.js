import { VOID } from '../core/tokens.js';
import { BinaryArray } from './BinaryArray.js';
export const consoleElement = document.getElementById('console');
const prefixDep = (dep, prefix = '') =>
  Object.entries(dep).reduce((acc, [key, value]) => {
    if (!acc[prefix]) acc[prefix] = {};
    acc[prefix][key] = value;
    return acc;
  }, {});
export const print = function (...values) {
  if (values.length === 0) {
    return VOID;
  }
  values.forEach(
    x => (consoleElement.value += `[ ${JSON.stringify(x) ?? null} ]`)
  );
  return values;
};
const object = {
  jsonString: object => JSON.stringify(object),
  jsonParse: string => JSON.parse(string),
  clone: obj => structuredClone(obj),
  has: (obj, ...props) => +props.every(x => x in obj),
  keys: obj => Object.keys(obj),
  values: obj => Object.values(obj),
  entries: obj => Object.entries(obj),
  fromEntries: entries => Object.fromEntries(entries),
  freeze: obj => void Object.freeze(obj) ?? obj,
  size: obj => Object.keys(obj).length,
  float32Array: (...items) => new Float32Array(items),
  float64Array: (...items) => new Float64Array(items)
  // set: (entity, prop, ...values) => entity[prop].set(...values),
  // get: (entity, prop) => entity[prop] ?? VOID
};
export const protolessModule = methods => {
  const env = Object.create(null);
  for (const method in methods) {
    env[method] = methods[method];
  }
  return env;
};
const bitwise = protolessModule({
  ['!']: operand => +!operand,
  ['^']: (left, right) => left ^ right,
  ['>>>']: (left, right) => left >>> right,
  ['>>']: (left, right) => left >> right,
  ['<<']: (left, right) => left << right,
  ['~']: operand => ~operand,
  ['|']: (left, right) => left | right,
  ['&']: (left, right) => left & right
});
const operations = protolessModule({
  ['+']: (first, ...args) => args.reduce((acc, x) => (acc += x), first),
  ['-']: (first, ...args) => args.reduce((acc, x) => (acc -= x), first),
  ['*']: (first, ...args) => args.reduce((acc, x) => (acc *= x), first),
  ['/']: (first, ...args) => args.reduce((acc, x) => (acc /= x), first),
  ['==']: (first, ...args) => +args.every(x => first === x),
  ['!=']: (first, ...args) => +args.every(x => first != x),
  ['>']: (first, ...args) => +args.every(x => first > x),
  ['<']: (first, ...args) => +args.every(x => first < x),
  ['>=']: (first, ...args) => +args.every(x => first >= x),
  ['<=']: (first, ...args) => +args.every(x => first <= x),
  ['%']: (left, right) => left % right,
  ['**']: (left, right) => left ** (right ?? 2)
});
const isSimilar = (a, b) => {
  const typeA = typeof a,
    typeB = typeof b;
  if (typeA !== typeB) return 0;
  if (typeA === 'number' || typeA === 'string' || typeA === 'boolean') {
    return +(a === b);
  }
  if (typeA === 'object') {
    const isArrayA = Array.isArray(a),
      isArrayB = Array.isArray(b);
    if (isArrayA !== isArrayB) return 0;
    if (isArrayA && isArrayB) {
      return a.length < b.length
        ? +a.every((item, index) => isSimilar(item, b[index]))
        : +b.every((item, index) => isSimilar(item, a[index]));
    } else {
      if (a === undefined || a === null || b === undefined || b === null)
        return +(a === b);
      for (const key in a) {
        if (!isSimilar(a[key], b[key])) {
          return 0;
        }
      }
      return 1;
    }
  }
};
const isEqual = (a, b) => {
  const typeA = typeof a,
    typeB = typeof b;
  if (typeA !== typeB) return 0;
  if (typeA === 'number' || typeA === 'string' || typeA === 'boolean') {
    return +(a === b);
  }
  if (typeA === 'object') {
    const isArrayA = Array.isArray(a),
      isArrayB = Array.isArray(b);
    if (isArrayA !== isArrayB) return 0;
    if (isArrayA && isArrayB) {
      if (a.length !== b.length) return 0;
      return +a.every((item, index) => isEqual(item, b[index]));
    } else {
      if (a === undefined || a === null || b === undefined || b === null)
        return +(a === b);
      if (Object.keys(a).length !== Object.keys(b).length) return 0;
      for (const key in a) {
        if (!isEqual(a[key], b[key])) {
          return 0;
        }
      }
      return 1;
    }
  }
};
export const colors = {
  makeRgbColor: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
  makeRgbAlphaColor: (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`,
  randomColor: () => `#${Math.floor(Math.random() * 16777215).toString(16)}`,
  randomLightColor: () =>
    '#' +
    ('00000' + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)).slice(
      -6
    ),
  invertColor: hex =>
    '#' +
    (Number(`0x1${hex.split('#')[1]}`) ^ 0xffffff)
      .toString(16)
      .substr(1)
      .toUpperCase()
};
const list = {
  node: prev => next => ({ prev, next }),
  prev: n => n.prev,
  next: n => n.next,
  range: low => high =>
    low > high ? null : list.node(low)(list.range(low + 1)(high)),
  map: f => n =>
    n === null ? null : list.node(f(list.prev(n)))(list.map(f)(list.next(n))),
  nodeToArray: node => {
    const result = [];
    while (node !== null) {
      result.push(list.prev(node));
      node = list.next(node);
    }
    return result;
  },
  arrayToNode: arrayLike => {
    let result = null;
    const array = Array.from(arrayLike);
    for (let i = array.length; i >= 0; i--) {
      result = list.node(array[i])(result);
    }
    return result;
  }
};
const iterators = {
  generator: function* (entity = [], index = 0) {
    while (true) {
      yield entity[index++];
    }
  },
  counter: function* (index = 0) {
    while (true) {
      yield index++;
    }
  },
  next: entity => entity.next().value,
  iterate: (iterable, callback) => {
    for (const i in iterable) {
      callback(i, iterable);
    }
    return iterable;
  },
  inside: (iterable, callback) => {
    for (const i in iterable) {
      callback(i);
    }
    return iterable;
  },
  forOfEvery: (iterable, callback) => {
    for (const x of iterable) {
      callback(x);
    }
    return iterable;
  },
  routine: (entity, times, callback) => {
    let out = VOID;
    for (let i = 0; i < times; i++) out = callback(entity, i);
    return out;
  },
  loop: (start, end, callback) => {
    for (let i = start; i < end; i++) callback(i);
  },
  whileTrue: (condition, callback) => {
    let out = VOID;
    while (condition()) out = callback();
    return out;
  },
  repeat: (times, callback) => {
    let out = VOID;
    for (let i = 0; i < times; i++) out = callback(i);
    return out;
  }
};
const SetCollection = {
  from: arr => new Set(arr),
  makeSet: (...args) => new Set(args),
  has: (entity, item) => +entity.has(item),
  add: (entity, ...values) => {
    values.forEach(x => entity.add(x));
    return entity;
  },
  remove: (entity, ...values) => {
    values.forEach(x => entity.delete(x));
  },
  inside: (entity, callback) =>
    entity.forEach((x, i, a) => callback(x)) ?? entity,
  union: (a, b) => {
    const out = new Set();
    a.forEach(item => out.add(item));
    b.forEach(item => out.add(item));
    return out;
  },
  intersection: (a, b) => {
    const out = new Set();
    b.forEach(item => {
      if (a.has(item)) out.add(item);
    });
    return out;
  },
  difference: (a, b) => {
    const out = new Set();
    a.forEach(item => {
      if (!b.has(item)) out.add(item);
    });
    return out;
  },
  symetricDifference: (a, b) => {
    const out = new Set();
    b.forEach(item => {
      if (!a.has(item)) out.add(item);
    });
    a.forEach(item => {
      if (!b.has(item)) out.add(item);
    });
    return out;
  },
  clear: entity => entity.clear(),
  fromArray: (...array) => new Set(...array),
  toArray: entity => [...entity],
  size: entity => entity.size
};
const time = {
  makeDate: date => new Date(date),
  currentTime: () => new Date().getTime(),
  currentDate: () => new Date(),
  getHour: date => date.getHours(),
  getMinute: date => date.getMinutes(),
  getSecond: date => date.getSeconds(),
  setInterval: (fn, ms) => setInterval(() => fn(), ms),
  clearInterval: id => clearInterval(id),
  setTimeout: (fn, ms) => setTimeout(() => fn(), ms),
  clearTimeout: id => clearTimeout(id)
};
const DOM = {
  makeButton: props => ({
    state: `{${props.state}; document.getElementById('button-${props.index}').addEventListener('click', ${props.onClick})};\n`,
    render: `<button id="button-${props.index}">${props.label}</button>`
  }),
  makeBody: elements =>
    `<body>${elements.map(e => e.render).join('\n')}</body>`,
  makeContainer: elements => ({
    state: '',
    render: `<div>${elements.map(e => e.render).join('\n')}</div>`
  }),
  makeScript: elements =>
    `<script>${elements.map(e => e.state).join('\n')}</script>`
};
export const STD = {
  void: VOID,
  VOID,
  _: VOID,
  null: VOID,
  NULL: VOID,
  tco:
    func =>
    (...args) => {
      let result = func(...args);
      while (typeof result === 'function') {
        result = result();
      }
      return result;
    },
  ...bitwise,
  ...operations
};
const events = {
  events: {},
  makeEvent: (entity, type, callback) => {
    entity.renderer.elem.addEventListener(type, callback);
  },
  click: (entity, callback) => {
    entity.renderer.elem.addEventListener('click', callback);
  },
  keyDown: callback =>
    void (events.events['keydown'] = e => callback(e)) ??
    window.addEventListener('keydown', events.events['keydown']),
  keyUp: callback =>
    void (events.events['keyup'] = e => callback(e)) ??
    window.addEventListener('keyup', events.events['keyup'])
};
const math = {
  mod: (left, right) => ((left % right) + right) % right,
  clamp: (num, min, max) => Math.min(Math.max(num, min), max),
  sqrt: num => Math.sqrt(num),
  inc: (a, i = 1) => (a += i),
  add: (a, b) => a + b,
  sub: (a, b) => a - b,
  mult: (a, b) => a * b,
  pow: (a, b) => a ** b,
  pow2: a => a ** 2,
  divide: (a, b) => a / b,
  sign: n => Math.sign(n),
  trunc: n => Math.trunc(n),
  exp: n => Math.exp(n),
  floor: n => Math.floor(n),
  round: n => Math.round(n),
  random: () => Math.random(),
  dice: (min, max) => Math.floor(Math.random() * (max - min + 1) + min),
  max: (...args) => Math.max(...args),
  min: (...args) => Math.min(...args),
  sin: n => Math.sin(n),
  cos: n => Math.cos(n),
  tan: n => Math.tan(n),
  atan: n => Math.atan(n),
  atan2: (y, x) => Math.atan2(y, x),
  log10: x => Math.log10(x),
  log2: x => Math.log2(x),
  log: x => Math.log(x),
  sum: arr => arr.reduce((acc, item) => (acc += item), 0),
  minInt: Number.MIN_SAFE_INTEGER,
  maxInt: Number.MAX_SAFE_INTEGER,
  infinity: Number.POSITIVE_INFINITY,
  negative: n => -n,
  PI: Math.PI,
  parseInt: (number, base) => parseInt(number.toString(), base),
  number: string => Number(string)
};
const request = {
  maybeJson: (url, callback) =>
    fetch(url)
      .then(res => res.json())
      .then(res => callback(res, VOID))
      .catch(err => callback(VOID, err)),
  maybeText: (url, callback) =>
    fetch(url)
      .then(res => res.json())
      .then(res => callback(res, VOID))
      .catch(err => callback(VOID, err))
};
const ARRAY = {
  ['map1']: (entity, callback) => entity.map(x => callback(x)),
  ['filter1']: (entity, callback) => entity.filter(x => callback(x)),
  ['reduce1']: (entity, callback, acc) =>
    entity.reduce(acc => callback(acc), acc),
  ['reduce2']: (entity, callback, acc) =>
    entity.reduce((acc, x) => callback(acc, x), acc),
  ['find1']: (entity, callback) => entity.find(x => callback(x)),
  ['some1']: (entity, callback) => entity.some(x => callback(x)),
  ['every1']: (entity, callback) => entity.every(x => callback(x)),
  ['map3']: (entity, callback) => entity.map((x, i, a) => callback(x, i, a)),
  ['filter3']: (entity, callback) =>
    entity.filter((x, i, a) => callback(x, i, a)),
  ['reduce3']: (entity, callback, acc) =>
    entity.reduce((acc, x, i, a) => callback(acc, x, i, a), acc),
  ['find3']: (entity, callback) => entity.find((x, i, a) => callback(x, i, a)),
  ['some3']: (entity, callback) => entity.some((x, i, a) => callback(x, i, a)),
  ['every3']: (entity, callback) =>
    entity.every((x, i, a) => callback(x, i, a)),
  compact: arr => arr.filter(Boolean),
  makeArray: (...items) => items,
  makeMatrix: (...dimensions) => {
    if (dimensions.length > 0) {
      const dim = dimensions[0];
      const rest = dimensions.slice(1);
      const arr = [];
      for (let i = 0; i < dim; i++) arr[i] = ARRAY.makeMatrix(...rest);
      return arr;
    } else {
      return VOID;
    }
  },
  unique: entity => {
    const set = new Set();
    return entity.reduce((acc, item) => {
      if (!set.has(item)) {
        set.add(item);
        acc.push(item);
      }
      return acc;
    }, []);
  },
  partition: (entity, groups = 1) =>
    entity.reduce((acc, _, index, arr) => {
      if (index % groups === 0) {
        const part = [];
        for (let i = 0; i < groups; i++) {
          const current = arr[index + i];
          if (current !== undefined) part.push(current);
        }
        acc.push(part);
      }
      return acc;
    }, []),
  indexedIteration: (entity, fn) =>
    entity.forEach((x, i, arr) => fn(i)) ?? VOID,
  forOf: (entity, fn) => entity.forEach((x, i, arr) => fn(x)) ?? VOID,
  each: (entity, fn) => entity.forEach((x, i, arr) => fn(x, i)) ?? VOID,
  from: items => Array.from(items),
  transform: (entity, callback) => {
    for (let i = 0; i < entity.length; i++) {
      entity[i] = callback(entity[i], i, entity);
    }
    return entity;
  },
  tail: entity => {
    entity.shift();
    return entity;
  },
  head: entity => {
    entity.pop();
    return entity;
  },
  map: (entity, callback) => entity.map(callback),
  filter: (entity, callback) => entity.filter(callback),
  reduce: (entity, callback, acc) => entity.reduce(callback, acc),
  forEach: (entity, callback) => entity.forEach(callback),
  reverse: entity => entity.reverse(),
  insertAtEnd: (entity, ...args) => {
    entity.push(...args);
    return entity;
  },
  removeFromEnd: entity => {
    entity.pop();
    return entity;
  },
  push: (entity, ...args) => entity.push(...args),
  pop: entity => entity.pop(),
  includes: (entity, arg) => +entity.includes(arg),
  isArray: entity => +entity.isArray(),
  unshift: (entity, ...args) => entity.unshift(...args),
  shift: entity => entity.shift(),
  fill: (entity, filling) => entity.fill(filling),
  find: (entity, callback) => entity.find(callback) ?? VOID,
  findIndex: (entity, callback) => entity.findIndex(callback),
  indexOf: (entity, item) => entity.indexOf(item),
  some: (entity, callback) => +entity.some(callback),
  every: (entity, callback) => +entity.every(callback),
  split: (str, separator) => str.split(separator),
  join: (entity, separator) => entity.join(separator),
  flat: (entity, level) => entity.flat(level),
  flatMap: (entity, callback) => entity.flatMap(callback),
  sort: (entity, callback) => entity.sort(callback),
  slice: (entity, ...args) => entity.slice(...args),
  splice: (entity, ...args) => entity.splice(...args),
  range: (start, end, step = 1) => {
    const arr = [];
    if (start > end) {
      for (let i = start; i >= end; i -= 1) {
        arr.push(i * step);
      }
    } else {
      for (let i = start; i <= end; i += 1) {
        arr.push(i * step);
      }
    }
    return arr;
  },
  at: (entity, index) => entity.at(index)
};
const BA = {
  ['remake1']: (entity, callback) =>
    entity.reduce(acc => callback(acc), new BinaryArray()),
  ['remake2']: (entity, callback) =>
    entity.reduce((acc, x) => callback(acc, x), new BinaryArray()),
  ['remake3']: (entity, callback) =>
    entity.reduce((acc, x, i) => callback(acc, x, i), new BinaryArray()),
  ['remake4']: (entity, callback) =>
    entity.reduce((acc, x, i, a) => callback(acc, x, i, a), new BinaryArray()),
  ['map1']: (entity, callback) => entity.map(x => callback(x)),
  ['map2']: (entity, callback) => entity.map((x, i) => callback(x, i)),
  ['map3']: (entity, callback) => entity.map((x, i, a) => callback(x, i, a)),
  ['filter1']: (entity, callback) => entity.filter(x => callback(x)),
  ['filter2']: (entity, callback) => entity.filter((x, i) => callback(x, i)),
  ['filter3']: (entity, callback) =>
    entity.filter((x, i, a) => callback(x, i, a)),
  ['reduce1']: (entity, callback, acc) =>
    entity.reduce(acc => callback(acc), acc),
  ['reduce2']: (entity, callback, acc) =>
    entity.reduce((acc, x) => callback(acc, x), acc),
  ['reduce3']: (entity, callback, acc) =>
    entity.reduce((acc, x, i) => callback(acc, x, i), acc),
  ['reduce4']: (entity, callback, acc) =>
    entity.reduce((acc, x, i, a) => callback(acc, x, i, a), acc),
  ['find1']: (entity, callback) => entity.find(x => callback(x)),
  ['find2']: (entity, callback) => entity.find((x, i) => callback(x, i)),
  ['find3']: (entity, callback) => entity.find((x, i, a) => callback(x, i, a)),
  ['some1']: (entity, callback) => entity.some(x => callback(x)),
  ['some2']: (entity, callback) => entity.some((x, i) => callback(x, i)),
  ['some3']: (entity, callback) => entity.some((x, i) => callback(x, i)),
  ['every1']: (entity, callback) => entity.every(x => callback(x)),
  ['every2']: (entity, callback) => entity.every((x, i) => callback(x, i)),
  ['every3']: (entity, callback) => entity.every((x, i) => callback(x, i)),
  compact: arr => arr.filter(Boolean),
  split: (str, separator) => BinaryArray.from(str.split(separator)),
  sizeOf: entity => entity.size,
  clone: entity =>
    BinaryArray.isBinaryArray(entity)
      ? new BinaryArray(
          entity.map(x =>
            BinaryArray.isBinaryArray(x)
              ? BinaryArray.isBinaryArray(x.get(0))
                ? BA.clone(x)
                : new BinaryArray(x)
              : x
          )
        )
      : new BinaryArray(entity),
  swap: (entity, a, b) => {
    const A = entity.get(a);
    const B = entity.get(b);
    entity.set(a, B);
    entity.set(b, A);
    return entity;
  },
  remake: (entity, fn) => entity.reduce(fn, new BinaryArray()),
  product: (a, b) => {
    const out = a.reduce((acc, item, i) => {
      acc._addToRight(new BinaryArray([item, b.get(i % b.size)]));
      return acc;
    }, new BinaryArray());
    out.balance();
    return out;
  },
  makeBinaryArray: (...items) => new BinaryArray(items),
  to: (entity, fn) => entity.mapMut(x => fn(x)),
  mutmap: (entity, fn) => entity.mapMut(fn),
  max: entity =>
    entity.reduce((acc, item) => (item > acc ? (acc = item) : acc), -Infinity),
  min: entity =>
    entity.reduce((acc, item) => (item < acc ? (acc = item) : acc), Infinity),
  array: entity => entity.toArray(),
  printBinaryArray: entity =>
    BinaryArray.isBinaryArray(entity)
      ? entity
          .map(x =>
            BinaryArray.isBinaryArray(x)
              ? BinaryArray.isBinaryArray(x.get(0))
                ? BA.printBinaryArray(x)
                : x.toArray()
              : x
          )
          .toArray()
      : entity,
  map: (entity, fn) => entity.map(fn),
  filter: (entity, fn) => entity.filter(fn),
  every: (entity, fn) => +entity.every(fn),
  some: (entity, fn) => +entity.some(fn),
  find: (entity, fn) => entity.find(fn) ?? VOID,
  findIndex: (entity, fn) => entity.findIndex(fn),
  at: (entity, index) => entity.at(index) ?? VOID,
  update: (entity, index, value) => {
    if (entity.get(index) !== undefined) {
      entity.set(index, value);
    }
    return entity;
  },
  join: (entity, separator) => entity.join(separator),
  union: (a, b) => {
    const out = new BinaryArray();
    const A = new Set(a.toArray());
    const B = new Set(b.toArray());
    A.forEach(item => out.push(item));
    B.forEach(item => out.push(item));
    out.balance();
    return out;
  },
  symetricDifference: (a, b) => {
    const out = new BinaryArray();
    const A = new Set(a.toArray());
    const B = new Set(b.toArray());
    B.forEach(item => {
      if (!A.has(item)) out.push(item);
    });
    A.forEach(item => {
      if (!B.has(item)) out.push(item);
    });
    out.balance();
    return out;
  },
  intersection: (a, b) => {
    const out = new BinaryArray();
    const A = new Set(a.toArray());
    const B = new Set(b.toArray());
    B.forEach(item => {
      if (A.has(item)) out.push(item);
    });
    out.balance();
    return out;
  },
  difference: (a, b) => {
    const out = new BinaryArray();
    const A = new Set(a.toArray());
    const B = new Set(b.toArray());
    A.forEach(item => {
      if (!B.has(item)) out.push(item);
    });
    out.balance();
    return out;
  },
  partition: (entity, groups = 1) => {
    const res = entity.reduce((acc, _, index, arr) => {
      if (index % groups === 0) {
        const part = new BinaryArray();
        for (let i = 0; i < groups; i++) {
          const current = arr.get(index + i);
          if (current !== undefined) part.push(current);
        }
        part.balance();
        acc.push(part);
      }
      return acc;
    }, new BinaryArray());
    res.balance();
    return res;
  },
  flat: (entity, level) => entity.flat(level),
  unique: entity => {
    const set = new Set();
    return BinaryArray.from(
      entity.reduce((acc, item) => {
        if (!set.has(item)) {
          set.add(item);
          acc.push(item);
        }
        return acc;
      }, [])
    );
  },
  tail: entity => {
    entity.shift();
    return entity;
  },
  head: entity => {
    entity.pop();
    return entity;
  },
  rotateRight: (entity, n) => {
    entity.rotateRight(n);
    return entity;
  },
  rotateLeft: (entity, n) => {
    entity.rotateLeft(n);
    return entity;
  },
  rotate: (entity, n, direction) => {
    entity.rotate(n, direction);
    return entity;
  },
  balance: entity => {
    entity.balance();
    return entity;
  },
  append: (entity, item) => {
    entity._addToRight(item);
    return entity;
  },
  prepend: (entity, item) => {
    entity._addToLeft(item);
    return entity;
  },
  empty: entity => {
    entity.clear();
    return entity;
  },
  isEmpty: entity => +!entity.size,
  reverse: entity => entity.reverse(),
  reduce: (entity, fn, initial) => entity.reduce(fn, initial),
  from: data => BinaryArray.from(data),
  sort: (entity, fn) => entity.sort(fn),
  last: entity => entity.get(entity.size - 1),
  first: entity => entity.get(0),
  pivot: entity => entity.pivot(),
  isBinaryArray: entity => +BinaryArray.isBinaryArray(entity),
  includes: (entity, arg) => +entity.includes(arg),
  splice: (entity, ...args) => entity.splice(...args),
  sum: entity => entity.reduce((acc, x) => (acc += x), 0),
  forOf: (entity, fn) => {
    entity.forEach((x, i) => fn(x, i));
    return entity;
  },
  inside: (entity, fn) => entity.forEach(x => fn(x)) ?? entity,
  each: (entity, fn) => {
    entity.forEach(fn);
    return entity;
  },
  range1: settings => {
    const arr = new BinaryArray();
    const { start, end, step } = settings;
    if (start > end) {
      for (let i = start; i >= end; i -= 1) {
        arr.push(i * step);
      }
    } else {
      for (let i = start; i <= end; i += 1) {
        arr.push(i * step);
      }
    }
    arr.balance();
    return arr;
  },
  range2: (start, end) => {
    const step = 1;
    const arr = new BinaryArray();
    if (start > end) {
      for (let i = start; i >= end; i -= 1) {
        arr.push(i * step);
      }
    } else {
      for (let i = start; i <= end; i += 1) {
        arr.push(i * step);
      }
    }
    arr.balance();
    return arr;
  },
  slice: (entity, ...args) => entity.slice(...args)
};
const CONV = {
  array: thing =>
    BinaryArray.isBinaryArray(thing) ? thing.toArray() : [...thing],
  boolean: thing => Boolean(thing),
  string: thing => thing.toString(),
  integer: number => parseInt(number.toString()),
  float: (number, base = 1) => +Number(number).toFixed(base),
  number: thing => Number(thing)
};
export const deps = {
  ...prefixDep(CONV, 'CONVERT'),
  ...prefixDep(BA, 'BINARYARRAY'),
  ...prefixDep(time, 'TIME'),
  ...prefixDep(list, 'LIST'),
  ...prefixDep(SetCollection, 'SET'),
  ...prefixDep(math, 'MATH'),
  ...prefixDep(
    {
      print,
      printLog: thing => console.log(...print(thing)),
      consoleLog: thing => console.log(thing)
    },
    'CONSOLE'
  ),
  ...prefixDep(
    {
      interpolate: (...args) =>
        args.reduce((acc, item) => (acc += item.toString()), ''),
      includes: (string, target) => string.includes(target),
      string: thing => thing.toString(),
      upperCase: string => string.toUpperCase(),
      lowerCase: string => string.toLowerCase(),
      trim: string => string.trim(),
      trimStart: string => string.trimStart(),
      trimEnd: string => string.trimEnd(),
      substring: (string, start, end) =>
        string.substring(start, end ?? end.length),
      replace: (string, match, replace) => string.replace(match, replace),
      sp: ' '
    },
    'STRING'
  ),
  ...prefixDep(object, 'OBJECT'),
  ...prefixDep(
    {
      isTrue: bol => +(!!bol === true),
      isFalse: bol => +(!!bol === false),
      isEqual: isEqual,
      isSimilar: isSimilar,
      isNotVoid: item => (item === VOID ? 0 : 1),
      isVoid: item => (item === VOID ? 1 : 0),
      makeBoolean: item => Boolean(item),
      or: (entity, other) => entity || other,
      isEmpty: item => (Object.keys(item).length === 0 ? 1 : 0),
      true: 1,
      false: 0,
      isEven: arg => (arg % 2 === 0 ? 1 : 0),
      isOdd: arg => (arg % 2 !== 0 ? 1 : 0),
      invert: val => +!val,
      isHaving: (obj, ...props) => +props.every(x => x in obj),
      areEqual: (item, ...args) =>
        +args.every(current => isEqual(item, current))
    },
    'LOGIC'
  ),
  ...prefixDep(iterators, 'LOOP'),
  ...prefixDep(colors, 'COLOR'),
  ...prefixDep(request, 'REQUEST'),
  ...prefixDep(DOM, 'DOM'),
  ...prefixDep(ARRAY, 'ARRAY')
};
