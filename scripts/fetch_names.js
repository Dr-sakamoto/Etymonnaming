const https = require('https');
const fs = require('fs');
const path = require('path');

const RAW_URL = 'https://raw.githubusercontent.com/Dr-sakamoto/vocab-app/main/ETYMON_NAMES.md';
const OUTPUT_PATH = path.join(__dirname, '../src/tagger/names_cache.json');

function fetchContent(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function parseStages(val) {
  if (!val || val === '—' || val === '') return null;
  if (val === '単独') return 'standalone';
  const n = parseInt(val);
  return isNaN(n) ? null : n;
}

function parseSection(val) {
  if (!val || val === '—' || val === '') return null;
  return val;
}

function parseTags(val) {
  if (!val || val.trim() === '') return [];
  return val.split('・').map(t => t.trim()).filter(Boolean);
}

function parseTable(markdown) {
  const lines = markdown.split('\n');
  const tableStart = lines.findIndex(l => l.includes('| 内部ID |'));
  if (tableStart === -1) throw new Error('Table not found in ETYMON_NAMES.md');

  const rows = [];
  for (let i = tableStart + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) break;

    const cells = line.split('|').slice(1, -1).map(c => c.trim());
    if (cells.length < 11) continue;

    const [id, base, mid, final_, stages, animal, status, section, habitat, type_, col10, col11] = cells;
    if (!id || id.startsWith('---')) continue;
    // ETYMON_NAMES.md may still be in the pre-mood 11-column format; treat col10 as
    // mood only once the table actually has 12 columns, else it's memo.
    const hasMood = cells.length >= 12;
    const mood_ = hasMood ? col10 : '';
    const memo = hasMood ? col11 : col10;

    rows.push({
      id,
      base: base === '—' || base === '' ? null : base,
      mid: mid === '—' || mid === '' ? null : mid,
      final: final_ === '—' || final_ === '' ? null : final_,
      stages: parseStages(stages),
      animal: animal === '—' || animal === '' ? null : animal,
      status: status || 'pending',
      section: parseSection(section),
      habitat: parseTags(habitat),
      type: parseTags(type_),
      mood: parseTags(mood_),
      memo: memo || ''
    });
  }

  return rows;
}

async function main() {
  console.log('Fetching ETYMON_NAMES.md from vocab-app...');
  const content = await fetchContent(RAW_URL);

  console.log('Parsing table...');
  const names = parseTable(content);
  console.log(`Parsed ${names.length} entries.`);

  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(names, null, 2), 'utf8');
  console.log(`Wrote ${names.length} entries to ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
