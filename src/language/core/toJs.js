import { compileHyperScriptToJavaScript } from './compiler.js';
import { parse } from './parser.js';

const pipe = `const _pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);`;
// const curry = `var _curry = (fn, ...args) => (arg) => fn(arg, ...args);`;
const tco = `const _tco = func => (...args) => { let result = func(...args); while (typeof result === 'function') { result = result(); }; return result };`;
const spread = `const _spread = (items) => Array.isArray(items[0]) ? items.reduce((acc, item) => [...acc, ...item], []) : items.reduce((acc, item) => ({ ...acc, ...item }), {});`;
const is_equal = `const _isEqual = (a, b) => {const typeA = typeof a, typeB = typeof b; if (typeA !== typeB) return 0; if (typeA === 'number' || typeA === 'string' || typeA === 'boolean') { return +(a === b); } if (typeA === 'object') { const isArrayA = Array.isArray(a), isArrayB = Array.isArray(b); if (isArrayA !== isArrayB) return 0; if (isArrayA && isArrayB) { if (a.length !== b.length) return 0; return +a.every((item, index) => _isEqual(item, b[index])); } else { if (a === undefined || a === null || b === undefined || b === null) return +(a === b); if (Object.keys(a).length !== Object.keys(b).length) return 0; for (const key in a) { if (!_isEqual(a[key], b[key])) { return 0; }} return 1; }}}`;
const is_similar = `const _isSimilar = (a, b) => { const typeA = typeof a, typeB = typeof b; if (typeA !== typeB) return 0; if (typeA === 'number' || typeA === 'string' || typeA === 'boolean') { return +(a === b); } if (typeA === 'object') { const isArrayA = Array.isArray(a), isArrayB = Array.isArray(b); if (isArrayA !== isArrayB) return 0; if (isArrayA && isArrayB) { return a.length < b.length ? +a.every((item, index) => _isSimilar(item, b[index])) : +b.every((item, index) => _isSimilar(item, a[index]));} else {if (a === undefined || a === null || b === undefined || b === null)return +(a === b);for (const key in a) {if (!_isSimilar(a[key], b[key])) {return 0;}}return 1;}}};`;
const protoless = `const protolessModule = methods => { const env = Object.create(null); for (const method in methods) env[method] = methods[method]; return env;};`;

const languageUtilsString = ` ${tco}\n${pipe}\n${spread}\n${is_equal}\n${is_similar}\n${protoless};`;

export const toJavasScript = ({ source, env }) => {
  const AST = parse(source);

  const { program, vars } = compileHyperScriptToJavaScript(AST);
  const tops = vars.length ? `var ${vars.join(',')};\n` : '';
  const script = `${languageUtilsString}
  const LIBRARY = new StandartLibrary();
  (()=>{
    ${tops}; 
    return ${program}
  })() 
`;
  return script;
};
