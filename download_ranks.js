import fs from 'fs';
import path from 'path';

const rankMap = [
  { rank: 'SS', url: "https://game8.jp/punipuni/323860" },
  { rank: 'S',  url: "https://game8.jp/punipuni/35821" },
  { rank: 'A',  url: "https://game8.jp/punipuni/35822" },
  { rank: 'B',  url: "https://game8.jp/punipuni/36046" },
  { rank: 'C',  url: "https://game8.jp/punipuni/38321" },
  { rank: 'D',  url: "https://game8.jp/punipuni/38521" },
  { rank: 'E',  url: "https://game8.jp/punipuni/38669" }
];

async function run() {
  for (const { rank, url } of rankMap) {
    try {
      console.log(`--- Fetching ${rank} ---`);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      
      const regex = /(https:\/\/img\.game8\.jp\/[0-9]+\/[a-zA-Z0-9_-]+\.(?:png|jpg|jpeg|webp)(?:\/[a-zA-Z0-9_-]+)?)/gi;
      const matches = Array.from(new Set(html.match(regex) || []));
      
      let count = 0;
      for (const imgUrl of matches) {
        if (imgUrl.includes('thumb') || imgUrl.includes('logo')) continue;
        try {
          const imgRes = await fetch(imgUrl);
          if (imgRes.ok) {
            const buffer = await imgRes.arrayBuffer();
            if (buffer.byteLength < 6000) continue; // skip small badges/icons
            count++;
            const fileName = `puni_${rank.toLowerCase()}_${count}.png`;
            const savePath = path.join(process.cwd(), `public`, fileName);
            fs.writeFileSync(savePath, Buffer.from(buffer));
            console.log(`Saved ${fileName} (${buffer.byteLength} bytes) from ${imgUrl}`);
            if (count >= 10) break;
          }
        } catch (e) {
          console.error(e.message);
        }
      }
    } catch (e) {
      console.error(e.message);
    }
  }
  console.log("ALL RANK IMAGES DOWNLOADED PROPERLY!");
}

run();




