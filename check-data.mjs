import { readFileSync } from 'fs'

const s = JSON.parse(readFileSync('./src/data/scenarios.json', 'utf-8'))
const c = JSON.parse(readFileSync('./src/data/scenario-connections.json', 'utf-8'))

const targets = new Set(c.map(x => x.target))
const sources = new Set(c.map(x => x.source))

console.log('=== Main scenarios (isSide=false) without incoming connection ===')
s.filter(sc => sc.isSide === false && sc.id !== '1' && !targets.has(sc.id))
  .forEach(sc => console.log(`  #${sc.id} ${sc.name}`))

console.log('')
console.log('=== Side scenarios (isSide=true) ===')
s.filter(sc => sc.isSide === true)
  .forEach(sc => console.log(`  #${sc.id} ${sc.name} - hasConn: ${targets.has(sc.id) || sources.has(sc.id)}`))

console.log('')
console.log('=== Connections mentioning #12 ===')
c.filter(x => x.source === '12' || x.target === '12')
  .forEach(x => console.log(' ', JSON.stringify(x)))

console.log('')
console.log(`Total: ${s.length} scenarios, ${c.length} connections`)
console.log(`Main: ${s.filter(x => x.isSide === false).length}, Side: ${s.filter(x => x.isSide === true).length}`)
