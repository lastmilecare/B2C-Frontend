/**
 * Hindi display for prescription print only (Devanagari + medical Hindi).
 * Does not mutate stored data.
 */

import {
  transliterateMixedText,
  transliterateProperName,
  transliterateLatinWord,
} from "./romanToDevanagari";

const DEVANAGARI_RE = /[\u0900-\u097F]/;

const EXACT_MAP = {
  male: "पुरुष",
  female: "महिला",
  other: "अन्य",
  tablet: "गोली",
  tablets: "गोली",
  capsule: "कैप्सूल",
  capsules: "कैप्सूल",
  syrup: "शरबत",
  injection: "इंजेक्शन",
  ointment: "मलहम",
  drops: "बूँदें",
  cream: "क्रीम",
  powder: "पाउडर",
  lotion: "लोशन",
  inhaler: "इनहेलर",
  routine: "सामान्य",
  urgent: "तत्काल",
  emergency: "आपातकालीन",
  chc: "सामुदायिक स्वास्थ्य केंद्र (CHC)",
  "district hospital": "जिला अस्पताल",
  specialist: "विशेषज्ञ",
  fit: "फिट",
  "fit with medication": "दवा के साथ फिट",
  "unfit & refer": "अनुपयुक्त एवं रेफर",
  "unfit and refer": "अनुपयुक्त एवं रेफर",
  morning: "सुबह",
  evening: "शाम",
  night: "रात",
  afternoon: "दोपहार",
  "early morning": "ब्रह्म मुहूर्त",
  midnight: "आधी रात",
  "before food": "भोजन से पहले",
  "after food": "भोजन के बाद",
  "before meals": "भोजन से पहले",
  "after meals": "भोजन के बाद",
  "with food": "भोजन के साथ",
  "empty stomach": "खाली पेट",
  "once daily": "दिन में एक बार",
  "twice daily": "दिन में दो बार",
  "thrice daily": "दिन में तीन बार",
  "three times a day": "दिन में तीन बार",
  "two times a day": "दिन में दो बार",
  "one time a day": "दिन में एक बार",
  bd: "दिन में दो बार",
  tid: "दिन में तीन बार",
  od: "दिन में एक बार",
  sos: "आवश्यकता अनुसार",
  prn: "आवश्यकता अनुसार",
  "as needed": "आवश्यकता अनुसार",
  "cost free": "निःशुल्क",
  employee: "कर्मचारी",
  worker: "कार्यकर्ता",
  contractor: "ठेकेदार",
  visitor: "आगंतुक",
  driver: "चालक",
  staff: "कर्मचारी",
  fever: "बुखार",
  headache: "सिरदर्द",
  cough: "खांसी",
  cold: "सर्दी",
  "body ache": "शरीर में दर्द",
  weakness: "कमजोरी",
  vomiting: "उल्टी",
  diarrhea: "दस्त",
  "abdominal pain": "पेट दर्द",
  "chest pain": "सीने में दर्द",
  "breathing difficulty": "सांस लेने में कठिनाई",
  hypertension: "उच्च रक्तचाप",
  diabetes: "मधुमेह",
  injury: "चोट",
  wound: "घाव",
  allergy: "एलर्जी",
  rest: "आराम",
  take: "लें",
  daily: "रोज़",
};

/** Full instruction / complaint phrases (English → Hindi) */
const SENTENCE_PHRASES = [
  ["take one tablet daily", "रोज़ एक गोली लें"],
  ["take 1 tablet daily", "रोज़ एक गोली लें"],
  ["take one tab daily", "रोज़ एक गोली लें"],
  ["take one capsule daily", "रोज़ एक कैप्सूल लें"],
  ["take one tablet twice daily", "दिन में दो बार एक गोली लें"],
  ["take one tablet three times daily", "दिन में तीन बार एक गोली लें"],
  ["after food", "भोजन के बाद"],
  ["before food", "भोजन से पहले"],
  ["with plenty of water", "पर्याप्त पानी के साथ"],
  ["plenty of fluids", "खूब तरल पदार्थ लें"],
  ["chief complaint", "मुख्य शिकायत"],
];

const PHRASE_REPLACEMENTS = [
  ["Fever", "बुखार"],
  ["fever", "बुखार"],
  ["Headache", "सिरदर्द"],
  ["headache", "सिरदर्द"],
  ["Cough", "खांसी"],
  ["cough", "खांसी"],
  ["Cold", "सर्दी"],
  ["cold", "सर्दी"],
  ["Body ache", "शरीर में दर्द"],
  ["body ache", "शरीर में दर्द"],
  ["Weakness", "कमजोरी"],
  ["weakness", "कमजोरी"],
  ["Vomiting", "उल्टी"],
  ["vomiting", "उल्टी"],
  ["Diarrhea", "दस्त"],
  ["diarrhea", "दस्त"],
  ["Abdominal pain", "पेट दर्द"],
  ["abdominal pain", "पेट दर्द"],
  ["Chest pain", "सीने में दर्द"],
  ["Breathing difficulty", "सांस लेने में कठिनाई"],
  ["Hypertension", "उच्च रक्तचाप"],
  ["Diabetes", "मधुमेह"],
  ["Injury", "चोट"],
  ["Wound", "घाव"],
  ["Allergy", "एलर्जी"],
  ["Follow up", "अनुवर्ती परीक्षण"],
  ["Rest", "आराम"],
  ["Lab test", "प्रयोगशाला परीक्षण"],
  ["X-ray", "एक्स-रे"],
  ["Blood test", "रक्त परीक्षण"],
  ["CBC", "पूर्ण रक्त गणना"],
  ["days", "दिन"],
  ["Days", "दिन"],
  ["day", "दिन"],
  ["Day", "दिन"],
  ["tablet", "गोली"],
  ["Tablets", "गोली"],
  ["Tablet", "गोली"],
];

const DEGREE_ABBREVIATIONS = new Set([
  "mbbs",
  "md",
  "ms",
  "bams",
  "bhms",
  "bpt",
  "mpt",
  "dnm",
  "dnb",
  "dm",
  "mch",
]);

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeKey = (value) =>
  value === null || value === undefined
    ? ""
    : String(value).trim().toLowerCase();

export const translateExact = (value) => {
  if (value === null || value === undefined || value === "") return value;
  const key = normalizeKey(value);
  if (EXACT_MAP[key]) return EXACT_MAP[key];
  return null;
};

const applySentencePhrases = (text) => {
  let out = String(text);
  const lower = out.toLowerCase().trim();
  for (const [en, hi] of SENTENCE_PHRASES) {
    if (lower === en) return hi;
  }
  const sorted = [...SENTENCE_PHRASES].sort((a, b) => b[0].length - a[0].length);
  for (const [en, hi] of sorted) {
    const re = new RegExp(escapeRegExp(en), "gi");
    out = out.replace(re, hi);
  }
  return out;
};

const applyPhraseReplacements = (text) => {
  let out = String(text);
  const sorted = [...PHRASE_REPLACEMENTS].sort(
    (a, b) => b[0].length - a[0].length,
  );
  for (const [en, hi] of sorted) {
    const re = new RegExp(`\\b${escapeRegExp(en)}\\b`, "gi");
    out = out.replace(re, hi);
  }
  return out;
};

const hasLatin = (text) => /[A-Za-z]/.test(String(text));

/**
 * Medical + instructional text: Hindi terms first, then transliterate remaining Latin.
 */
export const convertTextForHindiPrint = (value, options = {}) => {
  if (value === null || value === undefined || value === "") return value;

  const { mode = "general", transliterateNumbersAsWords = false } = options;
  let text = String(value).trim();
  if (!text) return value;

  if (DEVANAGARI_RE.test(text) && !hasLatin(text)) return text;

  const exact = translateExact(text);
  if (exact) return exact;

  text = applySentencePhrases(text);
  text = applyPhraseReplacements(text);

  if (mode === "name") {
    return transliterateProperName(text);
  }

  if (mode === "instruction" && !hasLatin(text)) return text;

  return transliterateMixedText(text, { transliterateNumbersAsWords });
};

export const translateCommaList = (value) => {
  if (value === null || value === undefined || value === "") return value;
  return String(value)
    .split(",")
    .map((part) => convertTextForHindiPrint(part.trim()))
    .join(", ");
};

export const translateGender = (gender) => {
  const exact = translateExact(gender);
  return exact || convertTextForHindiPrint(gender, { mode: "general" });
};

const translateDosage = (row) => {
  const dosage = row?.dosage;
  if (dosage === null || dosage === undefined || dosage === "") return dosage;
  if (row.typeOfMedicine?.toLowerCase() === "syrup") {
    return `${dosage} mL`;
  }
  return String(dosage);
};

export const translateMedicineRow = (row) => {
  if (!row) return row;

  return {
    ...row,
    item: convertTextForHindiPrint(row.item),
    typeOfMedicine:
      translateExact(row.typeOfMedicine) ||
      convertTextForHindiPrint(row.typeOfMedicine),
    remarks: convertTextForHindiPrint(row.remarks, { mode: "instruction" }),
    pillsConsumption: convertTextForHindiPrint(row.pillsConsumption),
    dosage: translateDosage(row),
    duration: row.duration ? `${row.duration} दिन` : row.duration,
  };
};

const translateQualification = (qualification) => {
  if (!qualification) return qualification;
  return String(qualification)
    .split(/(\s+|,)/)
    .map((part) => {
      if (/^\s+$/.test(part) || part === ",") return part;
      const key = part.replace(/\./g, "").toLowerCase();
      if (DEGREE_ABBREVIATIONS.has(key)) return part.toUpperCase();
      if (translateExact(part)) return translateExact(part);
      if (/^[A-Za-z]/.test(part)) return transliterateLatinWord(part);
      return part;
    })
    .join("");
};

/** Org address line for Hindi print header */
export const convertAddressForHindiPrint = (address) => {
  if (!address) return address;
  return convertTextForHindiPrint(address);
};

/**
 * Returns a shallow copy of prescription list row data with Hindi text for print.
 */
export const translatePrescriptionForHindiPrint = (data, tenantFeatures = {}) => {
  if (!data) return data;

  const showReferral = tenantFeatures.enableStructuredReferral;
  const showFitness = tenantFeatures.enableFitnessStatus;

  return {
    ...data,
    patientName: transliterateProperName(data.patientName),
    gender: translateGender(data.gender),
    patientType: convertTextForHindiPrint(data.patientType),
    chiefComplaints: translateCommaList(data.chiefComplaints),
    remarks: convertTextForHindiPrint(data.remarks, { mode: "instruction" }),
    labs: translateCommaList(data.labs),
    otherLabs: convertTextForHindiPrint(data.otherLabs),
    preventiveAdvice: convertTextForHindiPrint(data.preventiveAdvice, {
      mode: "instruction",
    }),
    history: convertTextForHindiPrint(data.history),
    otherInstructions: convertTextForHindiPrint(data.otherInstructions, {
      mode: "instruction",
    }),
    ...(showReferral
      ? {
          referrals: convertTextForHindiPrint(data.referrals),
          referralUrgency:
            translateExact(data.referralUrgency) ||
            convertTextForHindiPrint(data.referralUrgency),
          referralReason: convertTextForHindiPrint(data.referralReason),
          referralOutcome: convertTextForHindiPrint(data.referralOutcome),
        }
      : {}),
    ...(showFitness
      ? {
          fitnessStatus:
            translateExact(data.fitnessStatus) ||
            convertTextForHindiPrint(data.fitnessStatus),
        }
      : {}),
    doctor: data.doctor
      ? {
          ...data.doctor,
          name: transliterateProperName(data.doctor.name),
          qualification: translateQualification(data.doctor.qualification),
        }
      : data.doctor,
    adviceList: Array.isArray(data.adviceList)
      ? data.adviceList.map(translateMedicineRow)
      : data.adviceList,
    nextFollowup: data.nextFollowup
      ? `${data.nextFollowup} दिन`
      : data.nextFollowup,
  };
};