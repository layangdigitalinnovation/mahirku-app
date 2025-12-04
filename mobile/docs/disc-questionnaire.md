# Kuesioner DISC – Likert 1–5, Komponen, Rumus, dan Hasil

## Format Jawaban
- Skala Likert 1–5: 1 = Sangat Tidak Setuju, 5 = Sangat Setuju

## Komponen DISC
- D (Dominance): langsung, tegas, berorientasi hasil
- I (Influence): sosial, antusias, persuasif
- S (Steadiness): sabar, konsisten, suportif
- C (Compliance): analitis, teliti, sistematis

## Kuesioner (24 Pernyataan)
| No | Pernyataan | Komponen |
|---:|---|---|
| 1 | Saya nyaman mengambil keputusan cepat untuk mencapai target. | D |
| 2 | Saya suka memimpin dan mengarahkan tim. | D |
| 3 | Saya fokus pada hasil dibanding proses. | D |
| 4 | Saya tegas saat menetapkan standar kerja. | D |
| 5 | Saya berani mengambil risiko saat diperlukan. | D |
| 6 | Saya tetap melaju meskipun ada hambatan. | D |
| 7 | Saya mudah membangun relasi dengan orang baru. | I |
| 8 | Saya antusias saat berkolaborasi dalam kelompok. | I |
| 9 | Saya mudah menginspirasi orang lain lewat komunikasi. | I |
| 10 | Saya percaya dengan kekuatan persuasi. | I |
| 11 | Saya menikmati suasana kerja yang dinamis. | I |
| 12 | Saya ekspresif saat menyampaikan ide. | I |
| 13 | Saya konsisten menjaga ritme kerja yang stabil. | S |
| 14 | Saya mendukung rekan kerja saat mereka membutuhkan. | S |
| 15 | Saya tenang dalam menghadapi perubahan. | S |
| 16 | Saya fokus pada keharmonisan tim. | S |
| 17 | Saya sabar dan tidak mudah bereaksi berlebihan. | S |
| 18 | Saya setia pada komitmen yang telah disepakati. | S |
| 19 | Saya teliti dan memperhatikan detail. | C |
| 20 | Saya mengikuti prosedur dan standar dengan cermat. | C |
| 21 | Saya menganalisis masalah sebelum bertindak. | C |
| 22 | Saya menyukai data untuk mendukung keputusan. | C |
| 23 | Saya memilih pendekatan yang logis dan sistematis. | C |
| 24 | Saya mengevaluasi risiko dengan terukur. | C |

## Rumus Skoring
- DScore = sum(Jawaban item D: q1..q6)
- IScore = sum(Jawaban item I: q7..q12)
- SScore = sum(Jawaban item S: q13..q18)
- CScore = sum(Jawaban item C: q19..q24)
- Rentang skor per komponen: min = 6, max = 30 (24 item total, 6 per komponen, skala 1–5)
- Normalisasi (opsional): `persen = ((skor - min) / (max - min)) × 100`
- Tipe Dominan: komponen dengan skor tertinggi
- Aturan tie-break:
  - Jika ada dua skor tertinggi sama, gunakan prioritas konteks (mis. peran kerja) atau tampilkan keduanya sebagai “co-dominant”.
  - Jika tiga+ skor sama, tampilkan sebagai “balanced profile”.

## Komponen Hasil Jawaban
- Dominant Type: huruf (D/I/S/C) dan nama lengkap tipe
- Skor Detail: nilai DScore, IScore, SScore, CScore (dan versi persen jika dinormalisasi)
- Visual: bar chart/indicator untuk tiap komponen
- Deskripsi tipe:
  - D: Direct, firm, results-oriented
  - I: Outgoing, optimistic, persuasive
  - S: Patient, supportive, consistent
  - C: Analytical, precise, systematic
- Rekomendasi singkat (opsional): tips kolaborasi sesuai tipe dominan

## Contoh Hasil
- DScore: 26, IScore: 18, SScore: 20, CScore: 22
- Dominant Type: D (Dominance)
- Deskripsi: langsung, tegas, berorientasi hasil; efektif memimpin target jangka pendek
- Visual: bar D tertinggi, lainnya proporsional

