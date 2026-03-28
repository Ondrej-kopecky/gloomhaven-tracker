#!/usr/bin/env node
/**
 * Generate changelog.json from git tags and commits.
 * Groups patch versions under their minor version (e.g. 5.3.0-5.3.5 → "5.3").
 * Filters out chore:/docs:/brain: commits (only feat: and fix:).
 *
 * Usage: node scripts/generate-changelog.cjs
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// Skip in environments without git (e.g. Docker build)
try {
  execSync('git --version', { stdio: 'ignore' })
} catch {
  console.log('Git not available, skipping changelog generation (using existing changelog.json)')
  process.exit(0)
}

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8' }).trim()
}

// Get all tags sorted by version
const tags = run('git tag -l --sort=version:refname')
  .split('\n')
  .filter(t => /^v\d+\.\d+\.\d+$/.test(t))

if (tags.length === 0) {
  console.log('No tags found, skipping changelog generation')
  process.exit(0)
}

// For each consecutive pair of tags, get commits between them
const entries = [] // { tag, version, date, commits[] }

for (let i = 0; i < tags.length; i++) {
  const tag = tags[i]
  const prev = i > 0 ? tags[i - 1] : null
  const range = prev ? `${prev}..${tag}` : tag

  // Get tag date
  const date = run(`git log -1 --format=%ai ${tag}`).slice(0, 10)

  // Get commit messages in this range
  const logCmd = prev
    ? `git log ${prev}..${tag} --pretty=format:"%s" --no-merges`
    : `git log ${tag} --pretty=format:"%s" --no-merges -20`

  const rawCommits = run(logCmd)
  const commits = rawCommits
    .split('\n')
    .filter(Boolean)
    .filter(msg => /^(feat|fix)[:(]/.test(msg))
    .map(msg => {
      // Remove prefix: "feat: xyz" → "xyz", "fix(foo): xyz" → "xyz"
      return msg.replace(/^(feat|fix)(\([^)]*\))?:\s*/, '').trim()
    })
    .filter(Boolean)

  if (commits.length > 0) {
    entries.push({
      tag,
      version: tag.replace(/^v/, ''),
      date,
      commits,
    })
  }
}

// Also add unreleased commits (from last tag to HEAD)
const lastTag = tags[tags.length - 1]
const unreleasedRaw = run(`git log ${lastTag}..HEAD --pretty=format:"%s" --no-merges 2>/dev/null || true`)
if (unreleasedRaw) {
  const unreleased = unreleasedRaw
    .split('\n')
    .filter(Boolean)
    .filter(msg => /^(feat|fix)[:(]/.test(msg))
    .map(msg => msg.replace(/^(feat|fix)(\([^)]*\))?:\s*/, '').trim())
    .filter(Boolean)

  if (unreleased.length > 0) {
    const currentVersion = require('../package.json').version
    entries.push({
      tag: 'HEAD',
      version: currentVersion,
      date: new Date().toISOString().slice(0, 10),
      commits: unreleased,
    })
  }
}

// Group by minor version: 5.3.0, 5.3.1, ... → "5.3"
const grouped = {}
for (const entry of entries) {
  const parts = entry.version.split('.')
  const minor = `${parts[0]}.${parts[1]}`

  if (!grouped[minor]) {
    grouped[minor] = {
      version: minor,
      date: entry.date,
      changes: [],
    }
  }
  // Update date to the latest in group
  if (entry.date > grouped[minor].date) {
    grouped[minor].date = entry.date
  }
  // Add commits (deduplicate)
  for (const c of entry.commits) {
    if (!grouped[minor].changes.includes(c)) {
      grouped[minor].changes.push(c)
    }
  }
}

// Sort by version descending
const changelog = Object.values(grouped).sort((a, b) => {
  const [aMaj, aMin] = a.version.split('.').map(Number)
  const [bMaj, bMin] = b.version.split('.').map(Number)
  return bMaj - aMaj || bMin - aMin
})

const outPath = path.join(__dirname, '..', 'src', 'data', 'changelog.json')
fs.writeFileSync(outPath, JSON.stringify(changelog, null, 2), 'utf8')
console.log(`Changelog generated: ${changelog.length} versions, ${changelog.reduce((s, e) => s + e.changes.length, 0)} changes → ${outPath}`)
