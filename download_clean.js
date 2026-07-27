import fs from 'fs';
import path from 'path';

const rankMap = [
  { rank: 'SS', url: 'https://game8.jp/punipuni/323860' },
  { rank: 'S',  url: 'https://game8.jp/punipuni/35821' },
  { rank: 'A',  url: 'https://game8.jp/punipuni/35822' },
  { rank: 'B',  url: 'https://game8.jp/punipuni/36046' },
  { rank: 'C',  url: 'https://game8.jp/punipuni/38321' },
  { rank: 'D',  url: 'https://game8.jp/punipuni/38521' },
  { rank: 'E',  url: 'https://game8.jp/punipuni/38669' }
];

async function run() {
  const extractedByRank = {};
  for (const { rank, url } of rankMap) {
    console.log(`--- Extracting ${rank} ---`);
    extractedByRank[rank] = [];
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      const html = await res.text();
      
      const regex = /<img[^>]+alt="([^"]+)"[^>]*data-src="([^"]+)"/g;
      let m;
      const seenNames = new Set();
      let count = 0;
      
      while ((m = regex.exec(html)) !== null) {
        const alt = m[1];
        const src = m[2];
        if (alt.endsWith('の画像') && !alt.includes('Game8') && !alt.includes('ランク') && !alt.includes('アイコン')) {
          const name = alt.replace('の画像', '').trim();
          if (!seenNames.has(name) && src.includes('img.game8.jp')) {
            seenNames.add(name);
            count++;
            
            // Download image
            try {
              const imgRes = await fetch(src);
              if (imgRes.ok) {
                const buffer = await imgRes.arrayBuffer();
                if (buffer.byteLength > 1000) {
                  const fileName = `puni_${rank.toLowerCase()}_${count}.png`;
                  const savePath = path.join(process.cwd(), 'public', fileName);
                  fs.writeFileSync(savePath, Buffer.from(buffer));
                  extractedByRank[rank].push({ name, fileName, src });
                  console.log(`[${rank} #${count}] Saved ${name} as ${fileName}`);
                  if (count >= 10) break;
                }
              }
            } catch (e) {
              console.error(`Error fetching ${name}:`, e.message);
            }
          }
        }
      }
    } catch (e) {
      console.error(`Error rank ${rank}:`, e.message);
    }
  }

  fs.writeFileSync('character_map.json', JSON.stringify(extractedByRank, null, 2));
  console.log('DONE EXTRACTING CLEAN CHARACTERS!');
}

run();
