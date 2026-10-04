import sharp from "sharp";
import { readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const root = join(process.cwd(), "public", "works");

function walk(dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      entries.push(...walk(full));
    } else if (extname(name).toLowerCase() === ".png") {
      entries.push(full);
    }
  }
  return entries;
}

const files = walk(root).sort();
const mb = (n) => (n / 1024 / 1024).toFixed(2) + " MB";
const rel = (f) => f.replace(root + "/", "").replace(root + "\\", "");

let totalBefore = 0;
let totalAfter = 0;

for (const file of files) {
  const out = file.replace(/\.png$/i, ".webp");
  const before = statSync(file).size;
  totalBefore += before;

  await sharp(file)
    .resize({ width: 1440, withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(out);

  const after = statSync(out).size;
  totalAfter += after;
  console.log(`${rel(file)}  ${mb(before)} -> ${mb(after)}`);
}

console.log(
  `\n完成: ${files.length} 张, ${mb(totalBefore)} -> ${mb(totalAfter)} (${(
    (totalAfter / totalBefore) *
    100
  ).toFixed(1)}%)`,
);
