import Sanscript from "@indic-transliteration/sanscript";

const DEVANAGARI_RE = /[\u0900-\u097F]/;
const LATIN_WORD_RE = /^[A-Za-z][A-Za-z'’-]*$/;

/** Known places / name fragments → fixed Devanagari */
const WORD_TO_DEVANAGARI = {
  gurugram: "गुरुग्राम",
  gurgaon: "गुरुग्राम",
  delhi: "दिल्ली",
  "new delhi": "नई दिल्ली",
  noida: "नोएडा",
  mumbai: "मुंबई",
  bombay: "मुंबई",
  bengaluru: "बेंगलुरु",
  bangalore: "बेंगलुरु",
  chennai: "चेन्नई",
  kolkata: "कोलकाता",
  calcutta: "कोलकाता",
  hyderabad: "हैदराबाद",
  pune: "पुणे",
  jaipur: "जयपुर",
  lucknow: "लखनऊ",
  faridabad: "फरीदाबाद",
  ghaziabad: "गाजियाबाद",
  manesar: "मानेसर",
  dharuhera: "धारूहेड़ा",
  bawal: "बावल",
  singh: "सिंह",
  kumar: "कुमार",
  sharma: "शर्मा",
  verma: "वर्मा",
  gupta: "गुप्ता",
  yadav: "यादव",
  agarwal: "अग्रवाल",
  jain: "जैन",
  patel: "पटेल",
  reddy: "रेड्डी",
  rao: "राव",
  naidu: "नायडू",
  khan: "खान",
  ahmad: "अहमद",
  ahmed: "अहमद",
  mohd: "मोहम्मद",
  mohammed: "मोहम्मद",
  paracetamol: "पैरासिटामोल",
  ibuprofen: "आइबुप्रोफेन",
  dolo: "डोलो",
  crocin: "क्रोसिन",
  azithromycin: "अज़िथ्रोमाइसिन",
  amoxicillin: "अमोक्सिसिलिन",
  cetirizine: "सेटिरिज़ीन",
  pantoprazole: "पैंटोप्राज़ोल",
  omeprazole: "ओमेप्राज़ोल",
  metformin: "मेटफॉर्मिन",
};

/** Whole-word ITRANS overrides when Devanagari map is not used */
const WORD_TO_ITRANS = {
  naman: "namana",
  namen: "namana",
  rahul: "rAhula",
  priya: "priyA",
  ankit: "aMkita",
  vikash: "vikAsa",
  vikas: "vikAsa",
  rohit: "rohita",
  amit: "amita",
  sumit: "sumita",
  deepak: "dIpaka",
  suresh: "sureSa",
  ramesh: "rAmeSa",
  mahesh: "maheSa",
  rajesh: "rAjeSa",
  nitesh: "niteSa",
  ganesh: "gaNeSa",
};

const VOWEL_ITRANS = {
  a: "a",
  e: "e",
  i: "i",
  o: "o",
  u: "u",
};

const digitToHindiWord = {
  0: "शून्य",
  1: "एक",
  2: "दो",
  3: "तीन",
  4: "चार",
  5: "पाँच",
  6: "छह",
  7: "सात",
  8: "आठ",
  9: "नौ",
  10: "दस",
};

const normalizeWord = (word) =>
  String(word)
    .toLowerCase()
    .replace(/['’]/g, "")
    .trim();

const sanscriptFromItrans = (itrans) => {
  if (!itrans) return "";
  let out = Sanscript.t(itrans, "itrans", "devanagari");
  out = out.replace(/\u094D+$/u, "");
  return out;
};

/**
 * Heuristic: English (Indian) spelling → ITRANS for Sanscript.
 */
export const englishSpellingToItrans = (word) => {
  const w = normalizeWord(word);
  if (WORD_TO_ITRANS[w]) return WORD_TO_ITRANS[w];

  let s = w
    .replace(/ough/g, "O")
    .replace(/sch/g, "Sk")
    .replace(/sh/g, "S")
    .replace(/ch/g, "ch")
    .replace(/th/g, "th")
    .replace(/ph/g, "ph")
    .replace(/kh/g, "kh")
    .replace(/gh/g, "gh")
    .replace(/dh/g, "dh")
    .replace(/bh/g, "bh")
    .replace(/ee/g, "I")
    .replace(/oo/g, "U")
    .replace(/aa/g, "A")
    .replace(/ai/g, "ai")
    .replace(/au/g, "au")
    .replace(/ou/g, "au");

  const vowels = new Set(["a", "e", "i", "o", "u"]);
  const consMap = {
    b: "b",
    c: "k",
    d: "d",
    f: "ph",
    g: "g",
    h: "h",
    j: "j",
    k: "k",
    l: "l",
    m: "m",
    n: "n",
    p: "p",
    q: "k",
    r: "r",
    s: "s",
    t: "t",
    v: "v",
    w: "v",
    x: "ks",
    y: "y",
    z: "z",
  };

  let out = "";
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (vowels.has(ch)) {
      out += VOWEL_ITRANS[ch] ?? ch;
      continue;
    }
    const mapped = consMap[ch];
    if (!mapped) continue;
    out += mapped;
    const next = s[i + 1];
    const next2 = s[i + 2];
    const isVowelNext = next && vowels.has(next);
    if (!isVowelNext) {
      const cluster = `${ch}${next ?? ""}`;
      const skipSchwa =
        cluster === "ng" ||
        (next === "h" && ["s", "c", "t", "p", "k", "d", "b", "g"].includes(ch)) ||
        (next === "r" && ch !== "r");
      if (!skipSchwa && (next || i === s.length - 1)) {
        if (i === s.length - 1 && w.endsWith("e") && !w.endsWith("ee")) {
          /* silent terminal e in English spelling */
        } else if (!next) {
          out += "a";
        } else if (next && !vowels.has(next)) {
          out += "a";
        }
      }
    }
    if (ch === "n" && next === "g" && next2 && !vowels.has(next2)) {
      out = out.slice(0, -1) + "N";
      i += 1;
    }
  }

  return out || w;
};

export const transliterateLatinWord = (word) => {
  if (!word || DEVANAGARI_RE.test(word)) return word;
  if (!LATIN_WORD_RE.test(word)) return word;

  const lower = normalizeWord(word);
  if (WORD_TO_DEVANAGARI[lower]) return WORD_TO_DEVANAGARI[lower];

  const itrans = englishSpellingToItrans(lower);
  const dev = sanscriptFromItrans(itrans);
  return dev || word;
};

const TOKEN_SPLIT_RE =
  /(\d+(?:\.\d+)?(?:\/\d+(?:\.\d+)?)?|\d+\/\d+|(?:m|μ)?g|mg|mL|ml|%|°[FC]?|[^\sA-Za-z0-9\u0900-\u097F.'’-]+|[A-Za-z\u0900-\u097F][A-Za-z\u0900-\u097F'’-]*)/gu;

const isNumericToken = (token) =>
  /^(\d+(?:\.\d+)?|\d+\/\d+)$/.test(token) || /^(\d+)(mg|mL|ml|%)$/i.test(token);

/**
 * Transliterate Latin tokens in a line; leaves numbers, units, punctuation intact.
 */
const mapToken = (token, { transliterateNumbersAsWords }) => {
  if (!token) return token;
  if (isNumericToken(token)) return token;
  if (/^(mg|mL|ml|%|°[FC]?)$/i.test(token)) return token;
  if (/^[0-9]+$/.test(token) && transliterateNumbersAsWords) {
    const n = Number(token);
    if (digitToHindiWord[n] != null) return digitToHindiWord[n];
  }
  if (LATIN_WORD_RE.test(token)) return transliterateLatinWord(token);
  return token;
};

export const transliterateMixedText = (
  text,
  { transliterateNumbersAsWords = false } = {},
) => {
  if (text === null || text === undefined || text === "") return text;
  if (DEVANAGARI_RE.test(text) && !/[A-Za-z]/.test(text)) return text;

  const str = String(text);
  return str
    .split(/(\s+)/)
    .map((segment) => {
      if (/^\s+$/.test(segment)) return segment;
      if (/^[A-Za-z][A-Za-z'’-]*$/.test(segment)) {
        return transliterateLatinWord(segment);
      }
      const tokens = segment.match(TOKEN_SPLIT_RE);
      if (!tokens) return segment;
      return tokens
        .map((t) => mapToken(t, { transliterateNumbersAsWords }))
        .join("");
    })
    .join("");
};

/** Person / place names: each word transliterated, honorifics preserved. */
export const transliterateProperName = (name) => {
  if (name === null || name === undefined || name === "") return name;
  const str = String(name).trim();
  if (DEVANAGARI_RE.test(str) && !/[A-Za-z]/.test(str)) return str;

  const honorific = {
    dr: "डॉ.",
    mr: "श्री",
    mrs: "श्रीमती",
    ms: "सुश्री",
  };

  return str
    .split(/\s+/)
    .map((part) => {
      const key = part.toLowerCase().replace(/\./g, "");
      if (honorific[key]) return honorific[key];
      if (WORD_TO_DEVANAGARI[normalizeWord(part)]) {
        return WORD_TO_DEVANAGARI[normalizeWord(part)];
      }
      return transliterateLatinWord(part);
    })
    .join(" ");
};