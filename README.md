```text
              /\                      \ | /
            /    \        _\/_       -- * --
          /   /\   \     /    \       / | \
        /____/__\____\  /______\
         |  [=]  [=] |    |  |
         |____[#]____|    |__|         _~_
          ||  ||  ||\      ||        _/___\_
__________||__||__||_\_____||_______/_______\_____
  ~   ~     ~    ~     ~     ~   ~      ~      ~
    ~    ~     ~    \_/\_/     ~     ~     ~    ~
  ~    ~    ~    ~    ~     ~    ~      ~     ~
```


# Kamus Bahase Ogan

Penerjemah dua arah **Bahasa Ogan ↔ Bahasa Indonesia** (Base Ugan, Sumatera Selatan).
Aplikasi web statis berbasis Vite: tanpa backend, semua data ada di file JSON.

## Menjalankan

```bash
npm install
npm run dev      # development
npm run build    # hasil statis di dist/
```

## Struktur

```text
ogan-translator/
├── index.html                  # kerangka halaman
├── vite.config.js
├── package.json
├── .github/workflows/deploy.yml  # build + deploy otomatis ke GitHub Pages
├── docs/DATA_REVIEW.md         # kata yang artinya berbeda antar sumber (perlu dicek)
└── src/
    ├── main.js                 # titik masuk: import CSS lalu jalankan modul UI
    ├── styles/                 # variables, base, hero, translator, sections, dictionary, toast
    ├── js/
    │   ├── engine/             # mesin terjemah (tanpa DOM)
    │   │   ├── text-utils.js   # tokenisasi, huruf besar/kecil, escape HTML
    │   │   ├── lookup.js       # membangun indeks dari data JSON
    │   │   ├── word-rules.js   # aturan bunyi per kata (r->h, -a->-e, dst.)
    │   │   └── translate.js    # penerjemah kalimat (frasa, kontraksi ke-/se-)
    │   └── ui/                 # tampilan
    │       ├── translator-ui.js
    │       ├── dictionary-ui.js
    │       ├── sections-ui.js  # kartu "Tentang", "Aturan", "Cara kerja", tombol dukung
    │       ├── labels.js       # pengambil teks dari ui-text.json
    │       └── toast.js
    └── data/
        ├── dictionary.json     # kosakata (urutan file = prioritas pencarian)
        ├── phrases.json        # frasa
        ├── exceptions.json     # pengecualian aturan bunyi
        ├── quick-examples.json # tombol contoh cepat
        ├── about.json          # kartu wilayah tutur, arah sungai, cara kerja
        ├── sound-rules.json    # 6 aturan bunyi
        ├── support.json        # tautan tombol Dukung / Donasi
        └── ui-text.json        # teks antarmuka yang dibuat lewat JavaScript
```

## Menambah kata

Tambahkan satu objek di akhir `src/data/dictionary.json`:

```json
{
  "ogan": ["humah", "ghumah"],
  "indo": ["rumah"],
  "example": { "ogan": "Humah aku besak.", "indo": "Rumahku besar." }
}
```

- `ogan`: kata utama dulu, lalu variannya.
- `indo`: arti; arti pertama dipakai saat menerjemahkan Ogan → Indonesia.
- `example`: opsional.
- Jika dua entri memakai kata yang sama, entri yang **lebih atas** di file yang menang.

## Batasan & Catatan Penggunaan

Aplikasi ini masih memiliki keterbatasan dalam menerjemahkan kalimat utuh maupun struktur tata bahasa yang kompleks:

- **Berbasis Kamus & Aturan Bunyi:** Proses terjemahan bekerja melalui pencocokan kosakata kamus dan pola perubahan bunyi (*Base Ugan*), bukan model kecerdasan buatan (*neural translation*) yang memahami konteks kalimat secara menyeluruh.
- **Kalimat Panjang & Imbuhan Kompleks:** Susunan kalimat majemuk, ungkapan kiasan, atau kata berimbuhan bertingkat berpotensi diterjemahkan secara harfiah per kata.
- **Variasi Dialek Wilayah:** Kosakata dan pelafalan dapat berbeda antarwilayah tutur (seperti Ulu Ogan, Baturaja, hingga Ogan Ilir).

Untuk kebutuhan percakapan sehari-hari dan pencarian kosakata dasar, aplikasi ini sudah cukup membantu; namun untuk teks resmi atau konteks mendalam, disarankan tetap mengonfirmasinya kepada penutur asli Bahasa Ogan.


## Dukung Proyek

Jika aplikasi ini bermanfaat dan ingin mendukung pengembangan kosakata serta fitur berikutnya:

[![Dukung di Trakteer](https://img.shields.io/badge/Trakteer-Dukung%20hangugan-be1e2d?style=for-the-badge&logo=buymeacoffee&logoColor=white)](https://trakteer.id/hangugan)

