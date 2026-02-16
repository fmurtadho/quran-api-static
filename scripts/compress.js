const fs = require('fs');
const path = require('path');

// Konfigurasi
const SOURCE_DIR = './'; // Folder tempat file 1.json - 114.json berada
const OUTPUT_FILE = 'quran.min.json';

const result = {
  s: {}, // Metadata Surah: { id: [nama_latin, arti, jumlah_ayat] }
  f: ["s", "a", "ar", "lt", "id"], // Mapping kolom: surah, ayat, arabic, latin, id_translation
  d: []  // Data ayat: [[1, 1, "...", "...", "..."], ...]
};

console.log("Memulai kompresi data Al-Quran...");

try {
  // 1. Ambil Metadata Surah dari surah-list.json (jika ada)
  // Jika tidak ada, kita akan ambil dari file 1-114 saat looping
  let surahList = {};
  if (fs.existsSync(path.join(SOURCE_DIR, 'surah-list.json'))) {
    const listData = JSON.parse(fs.readFileSync(path.join(SOURCE_DIR, 'surah-list.json'), 'utf8'));
    // Sesuaikan mapping ini dengan struktur surah-list.json Anda
    listData.forEach(s => {
      surahList[s.id] = [s.latin, s.translation, s.num_ayah];
    });
    result.s = surahList;
  }

  // 2. Loop 1 - 114 surat
  for (let i = 1; i <= 114; i++) {
    const filePath = path.join(SOURCE_DIR, `${i}.json`);

    if (fs.existsSync(filePath)) {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      // Note: Struktur ini disesuaikan dengan contoh JSON yang Anda berikan sebelumnya
      // Content biasanya berupa Array berisi objek-objek ayat
      content.forEach(ayat => {
        // Masukkan data ke array murni tanpa nama key
        result.d.push([
          ayat.surah_id,
          ayat.ayah,
          ayat.arabic,
          ayat.latin,
          ayat.translation
        ]);

        // Jika metadata surah belum terisi, ambil dari sini
        if (!result.s[ayat.surah_id]) {
          result.s[ayat.surah_id] = [
            ayat.surah.latin.trim(),
            ayat.surah.translation,
            ayat.surah.num_ayah
          ];
        }
      });
      console.log(`Berhasil memproses Surat: ${i}`);
    }
  }

  // 3. Simpan ke file tunggal dengan minification (tanpa spasi)
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result));

  const stats = fs.statSync(OUTPUT_FILE);
  console.log("------------------------------------------");
  console.log(`Selesai! File: ${OUTPUT_FILE}`);
  console.log(`Ukuran Akhir: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  console.log("------------------------------------------");

} catch (err) {
  console.error("Terjadi kesalahan:", err);
}
