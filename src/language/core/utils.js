import { cell } from './parser.js';
import { tokens } from './tokens.js';
import {
  STD,
  consoleElement,
  print,
  protolessModule,
  popupContainer
} from '../extentions/extentions.js';
export const correctFilePath = filename => {
  if (!filename) return '';
  return '/' + filename.split('/').filter(Boolean).join('/');
};

export const State = {
  selectedRealm: 'realm0',
  lsHistory: '/',
  lastVisitedDir: '/',
  env: null,
  components: {},
  lastSelection: '',
  AST: {},
  activeWindow: null,
  comments: null,
  lastComposition: null,
  isLogged: false,
  isErrored: true
};
const dfs = ast => {
  let out = { fn: null, res: null };
  for (const prop in ast) {
    if (Array.isArray(ast[prop])) {
      for (const arg of ast[prop]) {
        if (arg.type === 'apply') {
          out.fn = arg.operator.name;
        }
        const temp = dfs(arg);
        if (temp.res !== undefined) {
          out.res = temp.res;
        }
      }
    } else if (ast[prop] !== undefined) {
      out.res = ast[prop];
    }
  }
  return out;
};

export const printErrors = (errors, args) => {
  if (!State.isErrored) {
    consoleElement.classList.remove('info_line');
    consoleElement.classList.add('error_line');
    State.isErrored = true;
    if (
      errors?.message &&
      (errors.message.includes('Maximum call stack size exceeded') ||
        errors.message.includes('too much recursion'))
    )
      return (consoleElement.value =
        'RangeError: Maximum call stack size exceeded ');
    const temp = dfs(args);
    if (temp.fn || temp.res) {
      consoleElement.value =
        errors +
        ' ( near ' +
        (temp.res.type === 'value' ? temp.res.value : temp.res.name ?? 'null') +
        (temp.fn ? ' in function ' + temp.fn + ' )  ' : ' )');
    } else {
      consoleElement.value = errors + ' ';
    }
  }
};
export const extractComments = source =>
  source
    .match(/[ ]+(?=[^"]*(?:"[^"]*"[^"]*)*$)+|\n|\t|;;.+/g)
    .filter(x => x[0] === ';' && x[1] === ';');
export const removeNoCode = source =>
  source.replace(/[ ]+(?=[^"]*(?:"[^"]*"[^"]*)*$)+|\n|\t|;;.+/g, '');
export const wrapInBody = source => `=>[${source}]`;

export const exe = source => {
  const ENV = protolessModule(STD);
  ENV[';;tokens'] = protolessModule(tokens);
  try {
    const { result, AST, env } = cell(ENV)(wrapInBody(source));
    State.AST = AST;
    State.env = env;
    return result;
  } catch (err) {
    consoleElement.classList.remove('info_line');
    consoleElement.classList.add('error_line');
    consoleElement.value = consoleElement.value.trim() || err + ' ';
  }
};
export const addSpace = str => str + '\n';
export const revertComments = str => {
  if (State.comments) {
    const lines = str.split('\n');
    const stack = State.comments;
    return lines
      .map(line => (line[0] + line[1] === '##' ? stack.shift() : line))
      .join('\n');
  } else {
    return str;
  }
};
export const isBalancedParenthesis = sourceCode => {
  let count = 0;
  const stack = [];
  const str = sourceCode.replace(/"(.*?)"/g, '');
  const pairs = { ']': '[' };
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '[') {
      stack.push(str[i]);
    } else if (str[i] in pairs) {
      if (stack.pop() !== pairs[str[i]]) {
        count++;
      }
    }
  }

  return { str, diff: count - stack.length };
};
export const prettier = str => addSpace(str);

export const run = source => {
  popupContainer.style.display = 'none';
  State.isErrored = false;
  consoleElement.classList.add('info_line');
  consoleElement.classList.remove('error_line');
  consoleElement.value = '';
  source = source.trim();
  const sourceCode = removeNoCode(source);

  const parenMatcher = isBalancedParenthesis(sourceCode);
  if (parenMatcher.diff === 0) {
    const result = exe(sourceCode);
    !State.isErrored && print(result);
  } else {
    printErrors(
      `Parenthesis are unbalanced by ${parenMatcher.diff > 0 ? '+' : ''}${
        parenMatcher.diff
      } "]"`
    );
  }
};

export const pruneDep = () => {
  const ignore = [
    ...['_', 'tco', 'void', 'VOID', 'NULL', 'null', ';;tokens', 'IMP', 'SIGN'],
    ...['!', '^', '>>>', '>>', '<<', '~', '|', '&'],
    ...['+', '-', '*', '/', '==', '!=', '>', '<', '>=', '<=', '%', '**']
  ];
  const list = { ...STD };
  ignore.forEach(op => {
    delete list[op];
  });
  for (const l in list) {
    list[l] = Object.keys(list[l]);
  }
  return list;
};

export const encodeUrl = (source, limit = 2000) => {
  const value = removeNoCode(source);
  const out = value
    .split('];]')
    .join(']]')
    .split('')
    .reduce(
      (acc, item, index, items) => {
        if (item === ']') {
          acc.count++;
        } else {
          if (acc.count === 1) {
            acc.result += ']';
            acc.count = 0;
          } else if (acc.count > 1) {
            acc.result += "'" + acc.count;
            acc.count = 0;
          }
          acc.result += item;
        }

        return acc;
      },
      { result: '', count: 0 }
    );
  if (out.count > 0) {
    out.result += "'" + out.count;
  }
  const encoded = LZUTF8.compress(out.result.trim(), {
    outputEncoding: 'Base64'
  });
  if (encoded.length > limit) {
    printErrors(
      `Code is too large. Expected code < ${limit}. Reduce your code by ${
        limit - encoded.length
      } chararacters.`
    );
  } else {
    return encoded;
  }
};
export const decodeUrl = url => {
  const value = LZUTF8.decompress(url, {
    inputEncoding: 'Base64',
    outputEncoding: 'String'
  }).trim();
  const suffix = [...new Set(value.match(/\'+?\d+/g))];
  const matcher = suffix.reduce(
    (acc, m) => acc.split(m).join(']'.repeat(parseInt(m.substring(1)))),
    value
  );
  return matcher;
};
