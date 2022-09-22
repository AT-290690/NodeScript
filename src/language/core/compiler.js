const vars = new Set()
const symbols = { ':': '/' }
const dfs = (tree, locals) => {
  if (!tree) return ''
  if (tree.type === 'apply') {
    switch (tree.operator.name) {
      case '=>':
        return `(()=>{${tree.args
          .map((x, i) => {
            const res = dfs(x, locals)
            if (res !== undefined && i === tree.args.length - 1) {
              return ';return ' + res.toString().trimStart()
            } else {
              return res
            }
          })
          .join('')}})()`
      case ':=':
      case '~=': {
        const res = dfs(tree.args[1], locals)
        locals.add(tree.args[0].name)
        if (res !== undefined) {
          return `(void(${tree.args[0].name}=${res})||${tree.args[0].name});`
        }
        break
      }
      case '=': {
        const res = dfs(tree.args[1], locals)
        return `(void(${tree.args[0].name}=${res})||${tree.args[0].name});`
      }
      case '->': {
        const args = tree.args
        const body = args.pop()
        const localVars = new Set()
        const evaluatedBody = dfs(body, localVars)
        const vars = localVars.size ? `var ${[...localVars].join(',')};` : ''
        return `(${args.map((x) => dfs(x, locals))}) => {${vars} ${
          body.type === 'apply' || body.type === 'value' ? 'return ' : ' '
        } ${evaluatedBody.trimStart()}};`
      }

      case '==':
        return '(' + tree.args.map((x) => dfs(x, locals)).join('===') + ')'
      case '+':
      case '-':
      case '*':
      case ':':
      case '!=':
      case '&&':
      case '||':
      case '>=':
      case '<=':
      case '>':
      case '<':
      case '??':
        return (
          '(' +
          tree.args
            .map((x) => dfs(x, locals))
            .join(symbols[tree.operator.name] ?? tree.operator.name) +
          ')'
        )
      case '%':
        return (
          '(' +
          dfs(tree.args[0], locals) +
          '%' +
          dfs(tree.args[1], locals) +
          ')'
        )
      case '!':
        return '!' + dfs(tree.args[0], locals)

      case '?': {
        const conditionStack = []
        tree.args
          .map((x) => dfs(x, locals))
          .forEach((x, i) => {
            if (i % 2 === 0) {
              conditionStack.push(x, '?')
            } else {
              conditionStack.push(x, ':')
            }
          })
        conditionStack.pop()
        if (conditionStack.length === 3) {
          conditionStack.push(':', 'null;')
        }
        return `(${conditionStack.join('')});`
      }
      case '*?': {
        const conditionStack = []
        tree.args
          .map((x) => dfs(x, locals))
          .forEach((x, i) => {
            if (i % 2 === 0) {
              conditionStack.push(x, '?')
            } else {
              conditionStack.push(x, ':')
            }
          })
        conditionStack.pop()
        conditionStack.push(':', '0;')
        return `(${conditionStack.join('')});`
      }
      case '.:':
        return '[' + tree.args.map((x) => dfs(x, locals)).join(',') + ']'
      case '::':
        return (
          '{' +
          tree.args
            .map((x) => dfs(x, locals))
            .reduce((acc, item, index) => {
              if (index % 2 === 0) {
                const key = item.replace(';', '')
                acc +=
                  key[0] === '"' ? `"${key.replaceAll('"', '')}":` : `[${key}]:`
              } else {
                acc += `${item},`
              }
              return acc
            }, '') +
          '}'
        )
      case 'tco': {
        const res = dfs(tree.args[0], locals)
        return '_tco(' + res + ')'
      }
      case '...':
        return `_spread([${tree.args.map((x) => dfs(x, locals)).join(',')}])`
      case '|>': {
        const [param, ...rest] = tree.args.map((x) => dfs(x, locals))
        return `_pipe(${rest.join(',')})(${param});`
      }
      // case ':':
      //   return `_curry(${tree.args.map(x => dfs(x, locals)).join(',')});`;
      case '.': {
        const prop = []
        for (let i = 1; i < tree.args.length; i++) {
          const arg = tree.args[i]
          prop.push(
            (arg.type === 'value'
              ? '"' + arg.value?.toString().trim().replaceAll('"', '') + '"'
              : dfs(arg, locals)) ?? null,
          )
        }
        const path = prop.map((x) => '[' + x + ']').join('')
        return `${dfs(tree.args[0], locals)}${path};`
      }
      case '.-': {
        const prop = []
        for (let i = 1; i < tree.args.length; i++) {
          const arg = tree.args[i]
          prop.push(
            (arg.type === 'value'
              ? '"' + arg.value?.toString().trim().replaceAll('"', '') + '"'
              : dfs(arg, locals)) ?? null,
          )
        }
        const path = prop.map((x) => '[' + x + ']').join('')
        const obj = dfs(tree.args[0], locals)
        return `(void(delete ${obj}${path})||${obj});`
      }
      case '.=': {
        const last = tree.args[tree.args.length - 1]
        const res = dfs(last, locals)
        const prop = []
        for (let i = 1; i < tree.args.length - 1; i++) {
          const arg = tree.args[i]
          prop.push(
            (arg.type === 'value'
              ? '"' + arg.value?.toString().trim().replaceAll('"', '') + '"'
              : dfs(arg, locals)) ?? null,
          )
        }

        const path = prop.map((x) => '[' + x + ']').join('')
        const obj = dfs(tree.args[0], locals)
        return `(void(${obj}${path}=${res})||${obj});`
      }
      default: {
        if (tree.operator.name) {
          return (
            tree.operator.name +
            '(' +
            tree.args.map((x) => dfs(x, locals)).join(',') +
            ');'
          )
        } else {
          if (tree.operator.operator.name === '<-') {
            const [lib, pref] = tree.args
            const imp =
              lib.type === 'word' ? lib.name : dfs(lib, locals).slice(0, -1)
            const methods = tree.operator.args.map((x) =>
              x.type === 'value' ? x.value : dfs(x, locals),
            )
            const prefix =
              pref && pref.type === 'value'
                ? pref.value.replaceAll(' ', '')
                : ''
            return methods
              .map((x) => {
                if (x) {
                  x = x.replaceAll(' ', '')
                  locals.add(`${prefix}${x}`)
                }
                return `${prefix}${x} = ${imp}["${x}"];`
              })
              .join('')
          } else if (
            tree.operator.operator.name === '.' &&
            tree.type === 'apply'
          ) {
            const [parent, method] = tree.operator.args
            const arg = tree.args.map((x) => dfs(x, locals))
            if (method.type === 'value') {
              return `${parent.name}["${method.value}"](${arg.join(',')});`
            } else {
              return `${parent.name}[${dfs(method, locals)}](${arg.join(',')});`
            }
          }
        }
      }
    }
  } else if (tree.type === 'word') {
    switch (tree.name) {
      case 'void':
      case 'VOID':
        return 'undefined'
      default:
        return tree.name
    }
  } else if (tree.type === 'value') {
    return tree.class === 'string' ? `"${tree.value}"` : tree.value
  }
}

const semiColumnEdgeCases = new Set([
  ';)',
  ';-',
  ';+',
  ';*',
  ';%',
  ';&',
  ';/',
  ';:',
  ';.',
  ';=',
  ';<',
  ';>',
  ';|',
  ';,',
  ';?',
  ',,',
  ';;',
  ';]',
])
export const compileHyperScriptToJavaScript = (ast) => {
  vars.clear()
  const raw = dfs(ast, vars)
  let program = ''
  for (let i = 0; i < raw.length; i++) {
    const current = raw[i]
    const next = raw[i + 1]
    if (!semiColumnEdgeCases.has(current + next)) {
      program += current
    }
  }

  return { program, vars: [...vars] }
}
