import { compileHyperScriptToJavaScript } from './compiler.js'
import { parse } from './parser.js'
const pipe = `const _pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);`
const tco = `const _tco = func => (...args) => { let result = func(...args); while (typeof result === 'function') { result = result(); }; return result };`
const spread = `const _spread = (items) => Array.isArray(items[0]) ? items.reduce((acc, item) => [...acc, ...item], []) : items.reduce((acc, item) => ({ ...acc, ...item }), {});`
const protoless = `const protolessModule = methods => { const env = Object.create(null); for (const method in methods) env[method] = methods[method]; return env;};`
export const languageUtilsString = ` ${tco}\n${pipe}\n${spread}\n${protoless};`
export const toJavasScript = ({ source }) => `LIBRARY = new StandartLibrary();
  ${compileHyperScriptToJavaScript(parse(source))}`
