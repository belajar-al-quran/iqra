const F = '\u064E', K = '\u0650', D = '\u064F', SUK = '\u0652', SH = '\u0651';
const FT = '\u064B', KT = '\u064D', DT = '\u064C', ZWJ = '\u200D';
const SUBALEF = '\u0656', INVDAMMA = '\u0657';
const V = { F: { m: F, l: 'a' }, K: { m: K, l: 'i' }, D: { m: D, l: 'u' } };

export const HURUF = [
  ['ا', 'Alif'], ['ب', 'Ba'], ['ت', 'Ta'], ['ث', 'Tsa'], ['ج', 'Jim'], ['ح', 'Ha'], ['خ', 'Kha'],
  ['د', 'Dal'], ['ذ', 'Dzal'], ['ر', 'Ra'], ['ز', 'Zai'], ['س', 'Sin'], ['ش', 'Syin'], ['ص', 'Shad'],
  ['ض', 'Dhad'], ['ط', 'Tha'], ['ظ', 'Zha'], ['ع', 'Ain'], ['غ', 'Ghain'], ['ف', 'Fa'], ['ق', 'Qaf'],
  ['ك', 'Kaf'], ['ل', 'Lam'], ['م', 'Mim'], ['ن', 'Nun'], ['و', 'Wawu'], ['ه', 'Ha (ه)'], ['ي', 'Ya']
];
const LAT = ['', 'b', 't', 'ts', 'j', 'h', 'kh', 'd', 'dz', 'r', 'z', 's', 'sy', 'sh', 'dh', 'th', 'zh',
  "'", 'gh', 'f', 'q', 'k', 'l', 'm', 'n', 'w', 'h', 'y'];

const ch = (i) => HURUF[i % 28][0];
const lt = (i) => LAT[i % 28];
const all = (fn) => HURUF.map((_, i) => fn(i));
const rest = (fn) => HURUF.map((_, i) => (i ? fn(i) : null)).filter(Boolean);
const range = (n) => Array.from({ length: n }, (_, i) => i);
const cell = (t, r = '', s = '') => ({ t, r, s });
const sy = (i, v) => ({ t: ch(i) + v.m, r: lt(i) + v.l });
const join = (parts) => cell(parts.map((p) => p.t).join(''), parts.map((p) => p.r).join('-'));
const idx = (c) => HURUF.findIndex((h) => h[0] === c);
const singles = (v) => all((i) => cell(sy(i, v).t, sy(i, v).r));
const nun = (letters) => [...letters].map((c) => cell('مِنْ ' + c + F));

const QAMARIYAH = [['أ', ''], ['ب', 'b'], ['غ', 'gh'], ['ح', 'h'], ['ج', 'j'], ['ك', 'k'], ['و', 'w'],
  ['خ', 'kh'], ['ف', 'f'], ['ع', "'"], ['ق', 'q'], ['ي', 'y'], ['م', 'm'], ['ه', 'h']];
const SYAMSIYAH = [['ت', 't'], ['ث', 'ts'], ['د', 'd'], ['ذ', 'dz'], ['ر', 'r'], ['ز', 'z'], ['س', 's'],
  ['ش', 'sy'], ['ص', 'sh'], ['ض', 'dh'], ['ط', 'th'], ['ظ', 'zh'], ['ل', 'l'], ['ن', 'n']];
const QALQALAH = [...'قطبجد'];

export const LEVELS = [
  {
    id: 1, title: 'Iqra Jilid 1', desc: 'Huruf tunggal berharakat fathah',
    intro: 'Jilid ini mengenalkan huruf Hijaiyah tunggal berharakat fathah (dibaca "a"), dibaca berurutan: a-ba, ba-ta, ta-tsa, dan seterusnya. Ketuk kotak untuk mendengar suaranya.',
    pages: [
      {
        title: 'Mengenal huruf', kind: 'grid', cols: 4, audio: true,
        note: 'Pengenalan tambahan: 28 huruf Hijaiyah. Ketuk huruf untuk mendengar namanya.',
        items: all((i) => cell(ch(i), HURUF[i][1]))
      },
      {
        title: 'Huruf berharakat fathah', kind: 'grid', cols: 4, audio: true,
        note: 'Fathah (garis miring kecil di atas huruf) dibaca "a". Contoh: بَ dibaca ba.',
        items: singles(V.F)
      },
      {
        title: 'Dua huruf berurutan', kind: 'grid', cols: 3,
        note: 'Baca dua huruf berurutan sesuai abjad. Contoh: اَبَ dibaca a-ba, بَتَ dibaca ba-ta.',
        items: range(27).map((i) => join([sy(i, V.F), sy(i + 1, V.F)]))
      },
      {
        title: 'Tiga huruf berurutan', kind: 'grid', cols: 2,
        note: 'Baca tiga huruf berurutan. Contoh: بَتَثَ dibaca ba-ta-tsa.',
        items: range(26).map((i) => join([sy(i, V.F), sy(i + 1, V.F), sy(i + 2, V.F)]))
      }
    ]
  },
  {
    id: 2, title: 'Iqra Jilid 2', desc: 'Huruf bersambung dan bacaan panjang',
    intro: 'Huruf bisa bersambung dan berubah bentuk. Di jilid ini juga dikenalkan bacaan panjang (mad) pada fathah + alif, agar bisa membedakan bacaan panjang dan pendek.',
    pages: [
      {
        title: 'Huruf bersambung', kind: 'forms',
        note: 'Bentuk huruf berubah: sendiri, di awal, di tengah, dan di akhir. Huruf ا د ذ ر ز و tidak bersambung ke huruf sesudahnya.'
      },
      {
        title: 'Fathah + mad alif', kind: 'grid', cols: 4,
        note: 'Fathah diikuti alif dibaca panjang 2 ketukan. Contoh: بَا dibaca baa.',
        items: all((i) => cell(ch(i) + F + 'ا', lt(i) + 'aa'))
      },
      {
        title: 'Latihan bersambung', kind: 'grid', cols: 2,
        note: 'Baca huruf yang bersambung. Perhatikan bacaan panjang di akhir. Contoh: بَتَا dibaca ba-taa.',
        items: all((i) => cell(ch(i) + F + ch(i + 6) + F + 'ا', lt(i) + 'a-' + lt(i + 6) + 'aa'))
      }
    ]
  },
  {
    id: 3, title: 'Iqra Jilid 3', desc: 'Kasrah, dhammah, dan bacaan panjangnya',
    intro: 'Kamu mengenal nama tanda baca: fathah, kasrah, dhammah, dan sukun, serta bacaan panjang kasrah dan dhammah.',
    pages: [
      {
        title: 'Huruf berharakat kasrah', kind: 'grid', cols: 4,
        note: 'Kasrah (garis miring kecil di bawah huruf) dibaca "i". Contoh: بِ dibaca bi.',
        items: singles(V.K)
      },
      {
        title: 'Huruf berharakat dhammah', kind: 'grid', cols: 4,
        note: 'Dhammah (tanda seperti huruf و kecil di atas huruf) dibaca "u". Contoh: بُ dibaca bu.',
        items: singles(V.D)
      },
      {
        title: 'Mad ya sukun dan waw sukun', kind: 'grid', cols: 4,
        note: 'Kasrah + ya sukun dibaca panjang "ii". Dhammah + waw sukun dibaca panjang "uu". Panjangnya 2 ketukan. Sukun (lingkaran kecil) berarti huruf mati.',
        items: all((i) =>
          i % 2 ? cell(ch(i) + D + 'و' + SUK, lt(i) + 'uu') : cell(ch(i) + K + 'ي' + SUK, lt(i) + 'ii')
        )
      },
      {
        title: 'Kasrah berdiri dan dhammah terbalik', kind: 'grid', cols: 4,
        note: 'Kasrah berdiri (garis tegak di bawah huruf) dibaca panjang "ii". Dhammah terbalik dibaca panjang "uu".',
        items: all((i) =>
          i % 2 ? cell(ch(i) + INVDAMMA, lt(i) + 'uu') : cell(ch(i) + SUBALEF, lt(i) + 'ii')
        )
      },
      {
        title: 'Latihan campuran', kind: 'grid', cols: 2,
        note: 'Perhatikan harakat tiap huruf, lalu baca a, i, atau u sesuai tandanya.',
        items: all((i) => join([sy(i, V.F), sy(i + 4, V.K), sy(i + 9, V.D)]))
      }
    ]
  },
  {
    id: 4, title: 'Iqra Jilid 4', desc: 'Tanwin, sukun, qalqalah',
    intro: 'Kamu belajar tanwin (bunyi an, in, un), ya sukun dan waw sukun setelah fathah, mim dan nun sukun, serta bacaan memantul (qalqalah).',
    pages: [
      {
        title: 'Tanwin fathah', kind: 'grid', cols: 4,
        note: 'Tanwin fathah (dua garis miring di atas) dibaca "an". Contoh: بًا dibaca ban.',
        items: all((i) => cell(ch(i) + FT + 'ا', lt(i) + 'an'))
      },
      {
        title: 'Tanwin kasrah dan dhammah', kind: 'grid', cols: 4,
        note: 'Tanwin kasrah (dua garis di bawah) dibaca "in". Tanwin dhammah (dua tanda dhammah) dibaca "un".',
        items: all((i) => (i % 2 ? cell(ch(i) + DT, lt(i) + 'un') : cell(ch(i) + KT, lt(i) + 'in')))
      },
      {
        title: 'Idzhar (dibaca jelas)', kind: 'grid', cols: 3,
        note: 'Nun sukun atau tanwin yang bertemu huruf ء ه ع ح غ خ dibaca jelas, tidak melebur.',
        items: nun(['أ', 'ه', 'ع', 'ح', 'غ', 'خ'])
      },
      {
        title: 'Ya sukun dan waw sukun', kind: 'grid', cols: 4,
        note: 'Fathah + ya sukun dibaca "ai" (بَيْ = bai). Fathah + waw sukun dibaca "au" (بَوْ = bau).',
        items: all((i) =>
          i % 2 ? cell(ch(i) + F + 'و' + SUK, lt(i) + 'au') : cell(ch(i) + F + 'ي' + SUK, lt(i) + 'ai')
        )
      },
      {
        title: 'Mim sukun dan nun sukun', kind: 'grid', cols: 4,
        note: 'Mim sukun dan nun sukun dibaca mati. Contoh: بَمْ dibaca bam, بَنْ dibaca ban.',
        items: all((i) =>
          i % 2 ? cell(ch(i) + F + 'ن' + SUK, lt(i) + 'an') : cell(ch(i) + F + 'م' + SUK, lt(i) + 'am')
        )
      },
      {
        title: 'Qalqalah', kind: 'grid', cols: 3,
        note: 'Huruf qalqalah ada lima: ق ط ب ج د. Jika mati (sukun), dibaca memantul. Contoh: اَقْ dibaca aq dengan pantulan.',
        items: QALQALAH.map((c) => cell('ا' + F + c + SUK, 'a' + lt(idx(c)))).concat(
          QALQALAH.map((c) => cell('ا' + K + c + SUK, 'i' + lt(idx(c))))
        )
      },
      {
        title: 'Latihan sukun', kind: 'grid', cols: 3,
        note: 'Huruf bersukun dibaca mati dan menyatu dengan huruf sebelumnya. Contoh: بَتْ dibaca bat.',
        items: all((i) => cell(ch(i) + F + ch(i + 9) + SUK, lt(i) + 'a' + lt(i + 9)))
      }
    ]
  },
  {
    id: 5, title: 'Iqra Jilid 5', desc: "Alif lam, waqaf, mad far'i, idgham",
    intro: "Kamu belajar alif lam qamariyah dan syamsiyah, tanda waqaf, mad far'i, nun sukun yang melebur (idgham), dan lam pada lafaz Allah.",
    pages: [
      {
        title: 'Alif lam qamariyah', kind: 'grid', cols: 4,
        note: 'Jika alif lam bertemu huruf qamariyah, lam dibaca jelas. Contoh: ٱلْبَ dibaca al-ba.',
        items: QAMARIYAH.map(([c, l]) => cell('ٱلْ' + c + F, 'al-' + l + 'a'))
      },
      {
        title: 'Tanda waqaf', kind: 'list',
        note: 'Tanda waqaf menurut Mushaf Standar Indonesia (Kemenag). Menunjukkan tempat berhenti atau lanjut saat membaca.',
        items: [
          cell('م', '', 'Wajib berhenti'),
          cell('ج', '', 'Boleh berhenti atau lanjut, sama baiknya'),
          cell('قلى', '', 'Boleh berhenti atau lanjut, lebih baik berhenti'),
          cell('صلى', '', 'Boleh berhenti atau lanjut, lebih baik lanjut'),
          cell('لا', '', 'Tidak boleh berhenti, kecuali di akhir ayat'),
          cell('∴ ∴', '', 'Tiga titik berjejer: berhenti di salah satu titik saja'),
          cell('س', '', 'Saktah: berhenti sejenak tanpa mengambil napas')
        ]
      },
      {
        title: "Mad far'i", kind: 'list',
        note: 'Pengenalan ringkas bacaan panjang lanjutan. Cocokkan jumlah ketukan dengan panduan gurumu.',
        items: [
          cell('جَآءَ', '', 'Mad wajib muttasil: mad bertemu hamzah dalam satu kata, dibaca 4-5 harakat'),
          cell('بِمَآ أُنزِلَ', '', 'Mad jaiz munfasil: mad bertemu hamzah di kata berikutnya, dibaca 2-5 harakat'),
          cell('ٱلرَّحِيمِ', '', "Mad 'arid lissukun: mad sebelum huruf akhir yang dimatikan karena berhenti, dibaca 2, 4, atau 6 harakat")
        ]
      },
      {
        title: 'Alif lam syamsiyah', kind: 'grid', cols: 4,
        note: 'Jika alif lam bertemu huruf syamsiyah, lam tidak dibaca dan huruf sesudahnya dibaca ganda (bertasydid). Contoh: ٱلتَّ dibaca at-ta.',
        items: SYAMSIYAH.map(([c, l]) => cell('ٱل' + c + SH + F, 'a' + l + '-' + l + 'a'))
      },
      {
        title: 'Idgham: nun sukun melebur', kind: 'grid', cols: 2,
        note: 'Nun sukun bertemu huruf idgham dibaca melebur. Idgham bighunnah (dengan dengung): ي ن م و. Idgham bilaghunnah (tanpa dengung): ل ر.',
        items: nun('ينمولر')
      },
      {
        title: 'Lam pada lafaz Allah', kind: 'list',
        note: 'Lam pada lafaz Allah dibaca tipis setelah kasrah dan tebal setelah fathah atau dhammah.',
        items: [
          cell('بِسْمِ ٱللَّهِ', '', 'Setelah kasrah: lam tipis'),
          cell('قَالَ ٱللَّهُ', '', 'Setelah fathah: lam tebal'),
          cell('رَسُولُ ٱللَّهِ', '', 'Setelah dhammah: lam tebal')
        ]
      }
    ]
  },
  {
    id: 6, title: 'Iqra Jilid 6', desc: "Iqlab, ikhfa', waqaf, awal surat",
    intro: "Jilid terakhir: idgham, iqlab, dan ikhfa' pada nun sukun atau tanwin, cara berhenti (waqaf), dan huruf-huruf di awal surat.",
    pages: [
      {
        title: 'Idgham bighunnah', kind: 'grid', cols: 2,
        note: 'Nun sukun atau tanwin bertemu ي ن م و dibaca melebur dengan dengung.',
        items: [...'ينمو'].flatMap((c, j) => [
          cell('مِنْ ' + c + F),
          cell('ب' + [FT, KT, DT][j % 3] + ' ' + c + F)
        ])
      },
      {
        title: 'Iqlab', kind: 'grid', cols: 3,
        note: 'Nun sukun atau tanwin bertemu huruf ب berubah bunyi menjadi mim dengan dengung. Contoh: مِنْ بَ dibaca mim-ba.',
        items: [
          cell('مِنْ بَ'), cell('مِنْ بِ'), cell('مِنْ بُ'),
          cell('بٌ بَ'), cell('بٍ بَ'), cell('بًا بَ')
        ]
      },
      {
        title: "Ikhfa'", kind: 'grid', cols: 3,
        note: "Nun sukun atau tanwin bertemu 15 huruf ikhfa' dibaca samar dengan dengung: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك.",
        items: nun('تثجدذزسشصضطظفقك')
      },
      {
        title: 'Cara berhenti (waqaf)', kind: 'list',
        note: 'Saat berhenti, huruf akhir dibaca mati.',
        items: [
          cell('ٱلْعَالَمِينَ', '', 'Harakat akhir dimatikan: dibaca al-aalamiin'),
          cell('عَلِيمٌ', '', 'Tanwin kasrah atau dhammah dimatikan: dibaca aliim'),
          cell('عَلِيمًا', '', 'Tanwin fathah dibaca alif: dibaca aliimaa'),
          cell('رَحْمَةٌ', '', 'Ta marbutah (ة) dibaca ha: dibaca rahmah')
        ]
      },
      {
        title: 'Qalqalah bertasydid', kind: 'grid', cols: 3,
        note: 'Huruf qalqalah (ق ط ب ج د) yang bertasydid di akhir bacaan ditekan, ditahan 2 harakat, lalu dibunyikan memantul.',
        items: QALQALAH.map((c) => cell('ا' + F + c + SH, 'a' + lt(idx(c)) + lt(idx(c))))
      },
      {
        title: 'Huruf awal surat', kind: 'list',
        note: 'Beberapa surat diawali huruf yang dibaca menurut nama hurufnya.',
        items: [
          cell('الم', '', 'Alif lam mim'),
          cell('المص', '', 'Alif lam mim shad'),
          cell('الر', '', 'Alif lam ra'),
          cell('المر', '', 'Alif lam mim ra'),
          cell('كهيعص', '', 'Kaf ha ya ain shad'),
          cell('طه', '', 'Tha ha'),
          cell('طسم', '', 'Tha sin mim'),
          cell('يس', '', 'Ya sin'),
          cell('حم', '', 'Ha mim'),
          cell('عسق', '', 'Ain sin qaf'),
          cell('ص', '', 'Shad'),
          cell('ق', '', 'Qaf'),
          cell('ن', '', 'Nun')
        ]
      }
    ]
  }
];

export const forms = (c) => [c, c + ZWJ, ZWJ + c + ZWJ, ZWJ + c];
