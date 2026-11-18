// Checks every locale against the French one: same keys, same ICU arguments, same tags, valid ICU syntax.
// Usage: node scripts/check-translations.mjs (from the repository root)
import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(path.resolve('app/package.json'))
let parse
try {
  ;({ parse } = require('@formatjs/icu-messageformat-parser'))
} catch {
  parse = undefined
}

const locales = ['en', 'de', 'es', 'it', 'ru']
// The same kinds of tags: a language may split a bold part in two (German puts the verb at the end)
const tags = (text) => [...new Set([...text.matchAll(/<\/?([a-z]+)>/g)].map((m) => m[0]))].sort().join(' ')
// An argument is {name} or {name, …}; the branches of a select or plural ("1 {Blue}", "=0 {…}") are not
const args = (text) =>
  [...new Set([...text.matchAll(/(?<!(?:\b(?:\d+|zero|one|two|few|many|other)|=\d+) )\{(\w+)[,}]/g)].map((m) => m[1]))].sort().join(' ')
let errors = 0
const fail = (message) => {
  errors++
  console.log('  ✗ ' + message)
}

for (const folder of ['translation', 'options']) {
  const source = JSON.parse(fs.readFileSync(`app/public/${folder}/fr.json`, 'utf8'))
  for (const locale of locales) {
    const file = `app/public/${folder}/${locale}.json`
    console.log(file)
    const target = JSON.parse(fs.readFileSync(file, 'utf8'))
    for (const key of Object.keys(source)) if (!(key in target)) fail(`missing ${key}`)
    for (const key of Object.keys(target)) if (!(key in source)) fail(`extra ${key}`)
    for (const [key, text] of Object.entries(target)) {
      if (!(key in source)) continue
      if (tags(text) !== tags(source[key])) fail(`${key}: tags ${tags(text)} ≠ ${tags(source[key])}`)
      if (args(text) !== args(source[key])) fail(`${key}: arguments ${args(text)} ≠ ${args(source[key])}`)
      if (/'[{}<]/.test(text)) fail(`${key}: an ASCII apostrophe before { } or < disappears in ICU`)
      if (parse) {
        try {
          parse(text)
        } catch (error) {
          fail(`${key}: invalid ICU (${error.message})`)
        }
      }
    }
  }
}
console.log(errors ? `${errors} error(s)` : 'All translations are consistent with French' + (parse ? '' : ' (ICU parser not found: syntax not checked)'))
process.exit(errors ? 1 : 0)
