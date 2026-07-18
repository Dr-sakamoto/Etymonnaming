const https = require('https');
const fs = require('fs');
const path = require('path');

// エリアスプライトの正本（vocab-app が直接読む JSON）を取得して
// tagger 用のローカルキャッシュ（areas_cache.json）を更新する。
// 正本のフォーマット: { "areas": [ { id, name, sprite, fallbackSprite }, ... ] }
const RAW_URL = 'https://raw.githubusercontent.com/Dr-sakamoto/vocab-app/main/lib/habitatSprites.json';
const OUTPUT_PATH = path.join(__dirname, '../src/tagger/areas_cache.json');

function fetchContent(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`HTTP ${res.statusCode}`));
        res.resume();
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function normalizeAreas(list) {
  return (Array.isArray(list) ? list : []).map(a => ({
    id: String((a && a.id) || ''),
    name: String((a && (a.name || a.id)) || ''),
    sprite: a && typeof a.sprite === 'string' ? a.sprite : '',
    fallbackSprite: a && typeof a.fallbackSprite === 'string' ? a.fallbackSprite : ''
  })).filter(a => a.id);
}

async function main() {
  console.log('Fetching lib/habitatSprites.json from vocab-app...');
  const content = await fetchContent(RAW_URL);

  const parsed = JSON.parse(content);
  const areas = normalizeAreas(Array.isArray(parsed) ? parsed : parsed.areas);
  console.log(`Parsed ${areas.length} areas.`);

  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(areas, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${areas.length} areas to ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  console.error('(vocab-app 側の lib/habitatSprites.json が main にまだ無い場合は、マージ後に再実行してください)');
  process.exit(1);
});
