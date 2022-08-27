import { cell } from './parser.js';
import { tokens } from './tokens.js';
import {
  STD,
  consoleElement,
  print,
  protolessModule
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
// ${
//   params
//     ? params
//         .map(([key, val]) => ':=($' + key + ';' + val + ')')
//         .join(';') + ';'
//     : ''
// }
//cell({ ...std })(`=>()`);
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
// export const stashComments = str => {
//   State.comments = str.match(/;;.+/g);
//   return str.replace(/;;.+/g, '##');
// };
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
        //if (str[str.length - 1] === ')') {
        //str = str.substr(str, str.length - 1);
        //} else if (str[str.length - 1] === ';' && str[str.length - 2] === ')') {
        // str = str.substr(str, str.length - 2);
        //}
      }
    }
  }
  // if (stack.length) {
  //   for (let i = 0; i < stack.length; i++) {
  //     str += ')';
  //   }
  // }
  return { str, diff: count - stack.length };
};
export const prettier = str => addSpace(str);
// .replace(/[ ]+(?=[^"]*(?:"[^"]*"[^"]*)*$)+/g, ' ')
// .split(';')
// .join('; ')
// .split('(')
// .join(' (');
// export const depResolution = source => {
//   const List = {};
//   source.match(/<-(.*)\[(.[A-Z"]+)\];/g)?.forEach(methods => {
//     const list = methods
//       .split('];')
//       .filter(x => x[0] === '<' && x[1] === '-' && x[2] === '[')
//       .join('];')
//       .replace(/\]|\[|<-+/g, ';')
//       .split(';')
//       .filter(Boolean)
//       .reduce(
//         (acc, item) => {
//           if (item[0] !== '"') {
//             acc._temp.push(item);
//           } else {
//             acc[item.substring(1, item.length - 1)] = [...acc._temp];
//             acc._temp = [];
//           }
//           return acc;
//         },
//         { _temp: [] }
//       );
//     delete list._temp;
//     for (const dep in list) {
//       list[dep].forEach(m => {
//         if (!List[dep]) List[dep] = {};
//         if (!deps[dep]) {
//           printErrors(`Module ${dep} does not exist`);
//           throw new SyntaxError(`Module ${dep} does not exist`);
//         } else if (deps[dep][m] === undefined) {
//           printErrors(
//             `Reference error Module ${dep} does not provide an export named ${m}`
//           );
//           throw new SyntaxError(
//             `Module ${dep} does not provide an export named ${m}`
//           );
//         } else {
//           List[dep][m] = deps[dep][m];
//         }
//       });
//     }
//   });
//   return List;
// };

export const run = source => {
  State.isErrored = false;
  consoleElement.classList.add('info_line');
  consoleElement.classList.remove('error_line');
  consoleElement.value = '';
  // const cursor = editor.getCursor();
  source = source.trim();
  // const comments = extractComments(source);
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
    ...['_', 'tco', 'void', 'VOID', 'NULL', 'null', ';;tokens'],
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
