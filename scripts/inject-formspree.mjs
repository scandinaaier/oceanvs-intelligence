// Replace the FORMSPREE_ID placeholder in dist/index.html with the value of
// VITE_FORMSPREE_ID at build time. The static landing keeps its inline JS
// untouched in source — this just rewrites the built artifact.
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

function readEnvLocal() {
  if (!existsSync('.env.local')) return {}
  const out = {}
  for (const line of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
  return out
}

const target = 'dist/index.html'
if (!existsSync(target)) {
  console.error(`[formspree] ${target} not found`)
  process.exit(0)
}

const id = process.env.VITE_FORMSPREE_ID || readEnvLocal().VITE_FORMSPREE_ID || ''
if (!id) {
  console.warn('[formspree] VITE_FORMSPREE_ID not set — landing form will toast "you\'re on the list" but no email will be delivered until set.')
  process.exit(0)
}

const html = readFileSync(target, 'utf8')
const replaced = html.replace(/const FORMSPREE_ID = '[^']*'/, `const FORMSPREE_ID = '${id}'`)
if (replaced === html) {
  console.warn('[formspree] FORMSPREE_ID placeholder not found in dist/index.html — landing source may have been edited')
} else {
  writeFileSync(target, replaced)
  console.log(`[formspree] Injected form ID into ${target}`)
}
