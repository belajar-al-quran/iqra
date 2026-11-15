const F = '\u064E', K = '\u0650', D = '\u064F', SUK = '\u0652', SH = '\u0651';
const FT = '\u064B', KT = '\u064D', DT = '\u064C', ZWJ = '\u200D';

export const HURUF = [
  ['ا', 'Alif'], ['ب', 'Ba'], ['ت', 'Ta'], ['ث', 'Tsa'], ['ج', 'Jim'], ['ح', 'Ha'], ['خ', 'Kha'],
  ['د', 'Dal'], ['ذ', 'Dzal'], ['ر', 'Ra'], ['ز', 'Zai'], ['س', 'Sin'], ['ش', 'Syin'], ['ص', 'Shad'],
  ['ض', 'Dhad'], ['ط', 'Tha'], ['ظ', 'Zha'], ['ع', 'Ain'], ['غ', 'Ghain'], ['ف', 'Fa'], ['ق', 'Qaf'],
  ['ك', 'Kaf'], ['ل', 'Lam'], ['م', 'Mim'], ['ن', 'Nun'], ['و', 'Wawu'], ['ه', 'Ha (ه)'], ['ي', 'Ya']
];

const ch = (i) => HURUF[i % 28][0];
const all = (fn) => HURUF.map((_, i) => fn(i));
const cell = (t, s = '') => ({ t, s });

const singles = (h) => all((i) => cell(ch(i) + h, HURUF[i][1]));
const pairs = (h, a) => all((i) => cell(ch(i) + h + ch(i + a) + h));
const triples = (h) => all((i) => cell(ch(i) + h + ch(i + 5) + h + ch(i + 11) + h));
const pick = (str) => [...str].map((c) => c);

const QAMARIYAH = pick('ابغحجكوخفعقيمه');
const SYAMSIYAH = pick('تثدذرزسشصضطظلن');

export const LEVELS = [
  {
    id: 1, title: 'Iqra Jilid 1', desc: 'Mengenal huruf dan fathah',
    pages: [
      { title: 'Mengenal huruf', kind: 'grid', cols: 4, audio: true, items: all((i) => cell(ch(i), HURUF[i][1])) },
      { title: 'Huruf berharakat fathah', kind: 'grid', cols: 4, audio: true, items: singles(F) },
      { title: 'Gabungan 2 huruf', kind: 'grid', cols: 3, items: pairs(F, 7) },
      { title: 'Gabungan 3 huruf', kind: 'grid', cols: 2, items: triples(F) }
    ]
  },
  {
    id: 2, title: 'Iqra Jilid 2', desc: 'Huruf bersambung dan bacaan panjang',
    pages: [
      { title: 'Huruf bersambung', kind: 'forms' },
      { title: 'Fathah + mad alif', kind: 'grid', cols: 4, items: all((i) => cell(ch(i) + F + 'ا')) },
      { title: 'Latihan bersambung', kind: 'grid', cols: 2, items: all((i) => cell(ch(i) + F + ch(i + 6) + F + 'ا')) }
    ]
  },
  {
    id: 3, title: 'Iqra Jilid 3', desc: 'Kasrah dan dhammah',
    pages: [
      { title: 'Huruf berharakat kasrah', kind: 'grid', cols: 4, items: singles(K) },
      { title: 'Huruf berharakat dhammah', kind: 'grid', cols: 4, items: singles(D) },
      {
        title: 'Mad ya dan mad waw', kind: 'grid', cols: 4,
        items: all((i) => cell(ch(i) + (i % 2 ? D + 'و' : K + 'ي')))
      },
      { title: 'Latihan campuran', kind: 'grid', cols: 2, items: all((i) => cell(ch(i) + F + ch(i + 4) + K + ch(i + 9) + D)) }
    ]
  },
  {
    id: 4, title: 'Iqra Jilid 4', desc: 'Sukun, qalqalah, tanwin',
    pages: [
      { title: 'Sukun', kind: 'grid', cols: 3, items: all((i) => cell(ch(i) + F + ch(i + 9) + SUK)) },
      {
        title: 'Qalqalah', kind: 'grid', cols: 3,
        note: 'Huruf qalqalah: ق ط ب ج د. Dibaca memantul saat sukun.',
        items: [...'قطبجد'].map((c) => cell('ا' + F + c + SUK)).concat([...'قطبجد'].map((c) => cell('ا' + K + c + SUK)))
      },
      { title: 'Tanwin fathah', kind: 'grid', cols: 4, items: all((i) => cell(ch(i) + FT + 'ا')) },
      {
        title: 'Tanwin kasrah dan dhammah', kind: 'grid', cols: 4,
        items: all((i) => cell(ch(i) + (i % 2 ? DT : KT)))
      }
    ]
  },
  {
    id: 5, title: 'Iqra Jilid 5', desc: 'Alif lam dan tanda waqaf',
    pages: [
      {
        title: 'Alif lam qamariyah', kind: 'grid', cols: 4,
        note: 'Lam dibaca jelas.',
        items: QAMARIYAH.map((c) => cell('ٱلْ' + c + F))
      },
      {
        title: 'Alif lam syamsiyah', kind: 'grid', cols: 4,
        note: 'Lam tidak dibaca, huruf sesudahnya dibaca bertasydid.',
        items: SYAMSIYAH.map((c) => cell('ٱل' + c + SH + F))
      },
      {
        title: 'Tanda waqaf', kind: 'list',
        items: [
          cell('م', 'Wajib berhenti'),
          cell('لا', 'Jangan berhenti'),
          cell('ج', 'Boleh berhenti atau lanjut'),
          cell('ط', 'Berhenti'),
          cell('صلى', 'Lebih baik lanjut'),
          cell('قلى', 'Lebih baik berhenti')
        ]
      }
    ]
  },
  {
    id: 6, title: 'Iqra Jilid 6', desc: 'Tasydid dan ghunnah',
    pages: [
      { title: 'Tasydid', kind: 'grid', cols: 4, items: all((i) => cell(ch(i) + SH + F)) },
      {
        title: 'Ghunnah (dengung)', kind: 'grid', cols: 3,
        note: 'Nun dan mim bertasydid dibaca dengung.',
        items: ['ن', 'م'].flatMap((c) => [F, K, D].map((h) => cell(c + SH + h)))
      },
      { title: 'Latihan campuran', kind: 'grid', cols: 2, items: all((i) => cell(ch(i) + SH + F + ch(i + 3) + K + 'ي')) }
    ]
  }
];

export const forms = (c) => [c, c + ZWJ, ZWJ + c + ZWJ, ZWJ + c];
