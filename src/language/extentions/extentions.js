import { VOID } from '../core/tokens.js';
import { BinaryArray } from './BinaryArray.js';
export const consoleElement = document.getElementById('console');
const canvasContainer = document.getElementById('canvas-container');

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

export const protolessModule = methods => {
  const env = Object.create(null);
  for (const method in methods) {
    env[method] = methods[method];
  }
  return env;
};

const _isSimilar = (a, b) => {
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
        ? +a.every((item, index) => _isSimilar(item, b[index]))
        : +b.every((item, index) => _isSimilar(item, a[index]));
    } else {
      if (a === undefined || a === null || b === undefined || b === null)
        return +(a === b);
      for (const key in a) {
        if (!_isSimilar(a[key], b[key])) {
          return 0;
        }
      }
      return 1;
    }
  }
};
const _isEqual = (a, b) => {
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
      return +a.every((item, index) => _isEqual(item, b[index]));
    } else {
      if (a === undefined || a === null || b === undefined || b === null)
        return +(a === b);
      if (Object.keys(a).length !== Object.keys(b).length) return 0;
      for (const key in a) {
        if (!_isEqual(a[key], b[key])) {
          return 0;
        }
      }
      return 1;
    }
  }
};

export class StandartLibrary {
  COLOR = {
    makeRgbColor: (r, g, b) => `rgb(${r}, ${g}, ${b})`,
    makeRgbAlphaColor: (r, g, b, a = 1) => `rgba(${r}, ${g}, ${b}, ${a})`,
    randomColor: () => `#${Math.floor(Math.random() * 16777215).toString(16)}`,
    randomLightColor: () =>
      '#' +
      (
        '00000' + Math.floor(Math.random() * Math.pow(16, 6)).toString(16)
      ).slice(-6),
    invertColor: hex =>
      '#' +
      (Number(`0x1${hex.split('#')[1]}`) ^ 0xffffff)
        .toString(16)
        .substr(1)
        .toUpperCase()
  };
  SKETCH = {
    VECTOR: {
      makeVector: (...args) => new Two.Vector(...args),
      zero: Two.Vector.zero,
      left: Two.Vector.left,
      right: Two.Vector.right,
      up: Two.Vector.up,
      down: Two.Vector.down,
      add: (a, b) => Two.Vector.add(a, b),
      subtract: (a, b) => Two.Vector.subtract(a, b),
      multiply: (a, b) => Two.Vector.add(a, b),
      divide: (a, b) => a.divide(b),
      dot: (a, b) => a.dot(b),
      normalize: vec => vec.normalize(),
      ratioBetween: (a, b) => Two.Vector.ratioBetween(a, b),
      angleBetween: (a, b) => Two.Vector.angleBetween(a, b),
      distanceBetween: (a, b) => Two.Vector.distanceBetween(a, b),
      distanceBetweenSquared: (a, b) => Two.Vector.distanceBetweenSquared(a, b),
      distanceTo: (a, b, e) => a.distanceTo(b, e),
      distanceToSquared: (a, b, e) => a.distanceToSquared(b, e),
      getX: vec => vec.x,
      getY: vec => vec.y,
      copy: (vec, d) => vec.copy(d),
      clear: vec => vec.clear(),
      clone: vec => vec.clone(),
      lerp: (vec, d, t) => vec.lerp(d, t),
      addSelf: (vec, a) => vec.addSelf(a),
      subtractSelf: (vec, a) => vec.subtractSelf(a),
      multiplySelf: (vec, a) => vec.multiplySelf(a),
      multiplyScalar: (vec, scalar) => vec.multiplyScalar(scalar),
      divideScalar: (vec, scalar) => vec.divideScalar(scalar),
      setLength: (vec, len) => vec.setLength(len),
      length: vec => vec.length(),
      rotate: (vec, angle) => vec.rotate(angle)
    },
    background: (color = 'var(--background-primary)') =>
      (canvasContainer.firstChild.style.background = color),
    requestAnimationFrame: fn => (animation = requestAnimationFrame(fn)),
    destroyComposition: () => {
      canvasContainer.style.background = 'var(--background-primary)';
      canvasContainer.innerHTML = '';
      this.SKETCH.engine?.removeEventListener('update');
    },
    makeScene: (width = 100, height = 100, callback) => {
      canvasContainer.innerHTML = '';
      this.SKETCH.engine?.removeEventListener('update');
      // this.SKETCH.engine?.removeEventListener('update');
      // window.removeEventListener('keydown', events.events['keydown']);
      this.SKETCH.engine = new Two({
        width,
        height
      }).appendTo(canvasContainer);
      callback();
      return 'Scene created!';
    },

    makeGrid: (size = 50, settings) => {
      size = Math.max(8, size);
      const defaults = {
        color: 'var(--comment)',
        opacity: 0.5,
        linewidth: 1
      };

      const { color, opacity, linewidth } = { ...defaults, ...settings };

      const t = this.SKETCH.engine;
      for (let i = 0; i < t.width; i++) {
        const line = t.makeLine(t.width, size * i, 0, i * size);
        line.stroke = color;
        line.opacity = opacity;
        line.linewidth = linewidth;
      }
      for (let i = 0; i < t.height; i++) {
        const line = t.makeLine(i * size, t.height, i * size, 0);
        line.stroke = color;
        line.opacity = opacity;
        line.linewidth = linewidth;
      }
    },
    makeFrame: (items, settings = {}) => {
      const group = this.SKETCH.engine.makeGroup(...items);
      this.SKETCH.showGroupBounds(group, settings);
      return group;
    },
    insertIntoGroup: (group, ...items) => {
      group.add(...items);
      return group;
    },
    removeFromGroup: item => {
      item.parent.remove(item);
      this.SKETCH.engine.add(item);
      return item;
    },
    removeFromScene: item => {
      item.remove();
      return VOID;
    },

    makeComp: (x, y, items, scale = 1) => {
      const group = this.SKETCH.engine.makeGroup();
      group.position.x = x;
      group.position.y = y;
      group.scale = scale;
      items.forEach(item => group.add(item));
      return group;
    },

    groupAdditions: group => group.additions,
    groupChildren: group => group.children,
    showGroupBounds: (group, settings = {}) => {
      settings = { padding: [1, 1], stroke: 'lime', linewidth: 1, ...settings };
      const rect = this.SKETCH.engine.makeRectangle(0, 0, 0, 0);
      const padding = settings.padding;
      rect.stroke = settings.stroke;
      rect.noFill();
      rect.linewidth = settings.linewidth;
      if (settings.dashes) {
        rect.dashes = settings.dashes;
      }
      if (settings.fixedSize) {
        rect.width = settings.fixedSize[0];
        rect.height = settings.fixedSize[1];
        group.add(rect);
      } else {
        const offset = { x: Infinity, y: Infinity };
        group.additions.forEach(item => {
          const bounds = item.getBoundingClientRect();
          const origin = item?.origin
            ? { x: item.origin.x + 0.5, y: item.origin.y + 0.5 }
            : item.constructor.name === 'Gt'
            ? { x: 0, y: 0 }
            : { x: 0.5, y: 0.5 };
          const X =
            item.position.x - bounds.width * origin.x - item.linewidth * 0.5;
          const Y =
            item.position.y - bounds.height * origin.y - item.linewidth * 0.5;
          if (X <= offset.x) {
            offset.x = X;
          }
          if (Y <= offset.y) {
            offset.y = Y;
          }
        });
        const bounds = group.getBoundingClientRect();
        group.add(rect);
        const scale = group.scale;
        const last = group.additions[group.additions.length - 1];
        last.position.x = (bounds.width * 0.5) / scale + offset.x;
        last.position.y = (bounds.height * 0.5) / scale + offset.y;
        last.width = (bounds.width * padding[0]) / scale;
        last.height = (bounds.height * padding[1]) / scale;
      }
      return rect;
    },
    width: (ratio = 1) => this.SKETCH.engine.width * ratio,
    height: (ratio = 1) => this.SKETCH.engine.height * ratio,
    add: (...args) => this.SKETCH.engine.add(...args),
    clear: () => this.SKETCH.engine.clear(),
    ignore: (...args) => this.SKETCH.engine.ignore(...args),
    interpret: index =>
      this.SKETCH.engine.interpret(document.getElementById(index)),
    listen: (...args) => this.SKETCH.engine.listen(...args),
    load: (...args) => this.SKETCH.engine.load(...args),
    makeArcSegment: (...args) => this.SKETCH.engine.makeArcSegment(...args),
    makeArrow: (...args) => this.SKETCH.engine.makeArrow(...args),
    makeCircle: (...args) => this.SKETCH.engine.makeCircle(...args),
    makeCurve: (...points) => this.SKETCH.engine.makeCurve(...points),
    makeEllipse: (...args) => this.SKETCH.engine.makeEllipse(...args),
    makeGroup: (...args) => this.SKETCH.engine.makeGroup(...args),
    makeImageSequence: (...args) =>
      this.SKETCH.engine.makeImageSequence(...args),
    makeLine: (...args) => this.SKETCH.engine.makeLine(...args),
    makeLinearGradient: (...args) =>
      this.SKETCH.engine.makeLinearGradient(...args),
    makePath: (...args) => this.SKETCH.engine.makePath(...args),
    makePoints: (...args) => this.SKETCH.engine.makePoints(...args),
    makePolygon: (...args) => this.SKETCH.engine.makePolygon(...args),
    makeRadialGradient: (...args) =>
      this.SKETCH.engine.makeRadialGradient(...args),
    makeRectangle: (...args) => this.SKETCH.engine.makeRectangle(...args),
    makeRoundedRectangle: (...args) =>
      this.SKETCH.engine.makeRoundedRectangle(...args),
    makeSprite: (...args) => this.SKETCH.engine.makeSprite(...args),
    makeStar: (...args) => this.SKETCH.engine.makeStar(...args),
    makeText: (...args) => this.SKETCH.engine.makeText(...args),
    makeTexture: (...args) => this.SKETCH.engine.makeTexture(...args),
    on: (...args) => this.SKETCH.engine.on(...args),
    off: (...args) => this.SKETCH.engine.off(...args),
    pause: (...args) => {
      this.SKETCH.engine.pause(...args);
      return 'Paused!';
    },
    play: (...args) => {
      this.SKETCH.engine.play(...args);
      return 'Playing!';
    },
    release: (...args) => this.SKETCH.engine.release(...args),
    remove: (...args) => this.SKETCH.engine.remove(...args),
    setPlaying: (...args) => this.SKETCH.engine.setPlaying(...args),
    trigger: (...args) => this.SKETCH.engine.trigger(...args),
    update: (...args) => {
      this.SKETCH.engine.update(...args);
      return 'Updated!';
    },
    noFill: entity => {
      entity.noFill();
      return entity;
    },
    noStroke: entity => {
      entity.noStroke();
      return entity;
    },
    draw: (lifespan, callback) => {
      if (callback && typeof callback === 'function') {
        this.SKETCH.engine.bind('update', callback);
        setTimeout(() => {
          this.SKETCH.engine.unbind('update', callback);
          this.SKETCH.engine.removeEventListener('update');
        }, 1000 * lifespan);
      }
    },
    setCompositionSize: (w, h) => {
      this.SKETCH.engine.width = w;
      this.SKETCH.engine.height = h;
    },
    setCompositionWidth: width => (this.SKETCH.engine.width = width),
    setCompositionHeight: height => (this.SKETCH.engine.height = height),
    setScreenSize: (w, h, showBorder = true) => {
      const svg = canvasContainer.firstChild;
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      if (showBorder) svg.style.border = '1px solid lime';
    },
    setOffsetStart: entity => {
      entity.position.x = entity.position.x + entity.width * 0.5;
      entity.position.y = entity.position.y + entity.height * 0.5;
      return entity;
    },
    setFill: (entity, fill) => {
      entity.fill = fill;
      return entity;
    },
    setStroke: (entity, stroke) => {
      entity.stroke = stroke;
      return entity;
    },
    setDashes: (entity, dashes) => {
      entity.dashes = dashes;
      return entity;
    },
    setLinewidth: (entity, linewidth) => {
      entity.linewidth = linewidth;
      return entity;
    },

    setPosition: (entity, x, y) => {
      entity.position.set(x, y);
      return entity;
    },
    setPositionX: (entity, x) => {
      entity.position.x = x;
      return entity;
    },
    setPositionY: (entity, y) => {
      entity.position.y = y;
      return entity;
    },
    setScale: (entity, s) => {
      entity.scale = s;
      return entity;
    },
    setOpacity: (entity, opacity) => {
      entity.opacity = opacity;
      return entity;
    },
    setRotation: (entity, a) => {
      entity.rotation = a;
      return entity;
    },
    setWidth: (entity, w) => {
      entity.width = w;
      return entity;
    },
    setHeight: (entity, h) => {
      entity.height = h;
      return entity;
    },
    setOrigin: (entity, x, y) => {
      entity.additions
        ? entity.additions.forEach(item => {
            item.position.set(item.position.x - x, item.position.y - y);
          })
        : entity.origin.set(x, y);
      return entity;
    },
    new: (prop, ...args) => new Two[prop](...args),
    getWidth: () => document.body.getBoundingClientRect().width,
    getHeight: () => document.body.getBoundingClientRect().height,
    getFromGroup: (group, index) => group.additions[index] ?? VOID,
    getOrigin: entity => entity.origin,
    getOpacity: entity => entity.opacity,
    getDashes: entity => entity.dashes,
    getPosition: entity => entity.position,
    getTranslation: entity => entity.translation,
    getBounds: entity => entity.getBoundingClientRect()
  };

  REQUEST = {
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
  TIME = {
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
  SET = {
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
  OBJECT = {
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
  MATH = {
    abs: num => Math.abs(num),
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
  STRING = {
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
  };
  CONVERT = {
    array: thing =>
      BinaryArray.isBinaryArray(thing) ? thing.toArray() : [...thing],
    boolean: thing => Boolean(thing),
    string: thing => thing.toString(),
    integer: number => parseInt(number.toString()),
    float: (number, base = 1) => +Number(number).toFixed(base),
    number: thing => Number(thing)
  };
  CONSOLE = {
    print,
    printLog: thing => console.log(...print(thing)),
    consoleLog: thing => console.log(thing)
  };
  LOGIC = {
    isTrue: bol => +(!!bol === true),
    isFalse: bol => +(!!bol === false),
    isEqual: _isEqual,
    isSimilar: _isSimilar,
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
    areEqual: (item, ...args) => +args.every(current => _isEqual(item, current))
  };
  LOOP = {
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
  ARRAY = {
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
    ['find3']: (entity, callback) =>
      entity.find((x, i, a) => callback(x, i, a)),
    ['some3']: (entity, callback) =>
      entity.some((x, i, a) => callback(x, i, a)),
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
  BINARYARRAY = {
    ['remake1']: (entity, callback) =>
      entity.reduce(acc => callback(acc), new BinaryArray()),
    ['remake2']: (entity, callback) =>
      entity.reduce((acc, x) => callback(acc, x), new BinaryArray()),
    ['remake3']: (entity, callback) =>
      entity.reduce((acc, x, i) => callback(acc, x, i), new BinaryArray()),
    ['remake4']: (entity, callback) =>
      entity.reduce(
        (acc, x, i, a) => callback(acc, x, i, a),
        new BinaryArray()
      ),
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
    ['find3']: (entity, callback) =>
      entity.find((x, i, a) => callback(x, i, a)),
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
      entity.reduce(
        (acc, item) => (item > acc ? (acc = item) : acc),
        -Infinity
      ),
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
}
export const STD = {
  void: VOID,
  VOID,
  _: VOID,
  null: VOID,
  NULL: VOID,
  LS: module => Object.keys(module),
  tco:
    func =>
    (...args) => {
      let result = func(...args);
      while (typeof result === 'function') {
        result = result();
      }
      return result;
    },
  LIBRARY: new StandartLibrary()
};
