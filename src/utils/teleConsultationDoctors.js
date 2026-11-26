/**
 * Tele consultation doctors (configured tenant).
 * Combo + OPD/prescription use Doctors.id — not Users.id.
 * Add more Doctors.id values when new tele doctors are onboarded.
 */
export const TELE_DOCTOR_IDS = [49];

/** Fallback labels until /combo/tele-doctor loads (doctor id → display). */
export const TELE_CONSULTATION_DOCTORS = [
  { id: 49, userId: 178, name: "Amrita Jha" },
];

export const TELE_VISIT_TYPE = "TELE";
export const PHYSICAL_VISIT_TYPE = "PHYSICAL";

export const isTeleDoctorId = (id) => {
  const n = Number(id);
  if (!n || Number.isNaN(n)) return false;
  if (TELE_DOCTOR_IDS.includes(n)) return true;
  return TELE_CONSULTATION_DOCTORS.some(
    (d) => Number(d.id) === n || Number(d.userId) === n,
  );
};

export const isTeleVisitType = (visitType) =>
  String(visitType || "")
    .trim()
    .toUpperCase() === TELE_VISIT_TYPE;

/** Merge API rows (Doctors.id) over fallback list. */
export const mergeTeleDoctorsFromApi = (apiRows = []) => {
  if (!Array.isArray(apiRows) || apiRows.length === 0) {
    return [...TELE_CONSULTATION_DOCTORS];
  }

  const byDoctorId = new Map(
    apiRows.map((r) => [
      Number(r.id),
      {
        id: Number(r.id),
        userId: r.user_id != null ? Number(r.user_id) : null,
        name: r.name || r.doctor_name || r.username || "",
        qualification: r.qualification || "",
        registration_number: r.registration_number || "",
      },
    ]),
  );

  const fromStatic = TELE_CONSULTATION_DOCTORS.map((d) => {
    const hit = byDoctorId.get(Number(d.id));
    if (!hit) return { ...d };
    return {
      id: hit.id,
      userId: hit.userId ?? d.userId,
      name: hit.name || d.name,
      qualification: hit.qualification || "",
      registration_number: hit.registration_number || "",
    };
  });

  const staticIds = new Set(fromStatic.map((d) => Number(d.id)));
  const extra = apiRows
    .filter((r) => !staticIds.has(Number(r.id)))
    .map((r) => ({
      id: Number(r.id),
      userId: r.user_id != null ? Number(r.user_id) : null,
      name: r.name || r.doctor_name || r.username || "",
      qualification: r.qualification || "",
      registration_number: r.registration_number || "",
    }));

  const merged = [...fromStatic, ...extra];
  return merged.length ? merged : fromStatic;
};