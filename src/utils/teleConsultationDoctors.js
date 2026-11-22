/**
 * Fixed tele-consultation doctors for configured tenant (VITE_TENANT_ID).
 * `id` / `userId` = Users.id (NOT Doctors.id).
 * Saved on OPD as ConsultantDoctorID / DoctorId and on prescription tele as ConsultingID.
 */
export const TELE_CONSULTATION_DOCTORS = [
  { id: 580, userId: 580, name: "Amrita Jha" },
  { id: 584, userId: 584, name: "Shiv Singh Rajawat" },
  { id: 602, userId: 602, name: "Ramesh Kumar Yadav" },
  { id: 608, userId: 608, name: "Dharam Pal" },
];

export const TELE_DOCTOR_USER_IDS = TELE_CONSULTATION_DOCTORS.map((d) => d.userId);

export const TELE_VISIT_TYPE = "TELE";
export const PHYSICAL_VISIT_TYPE = "PHYSICAL";

export const isTeleDoctorId = (id) =>
  TELE_CONSULTATION_DOCTORS.some(
    (d) => Number(d.userId) === Number(id) || Number(d.id) === Number(id),
  );

export const isTeleVisitType = (visitType) =>
  String(visitType || "")
    .trim()
    .toUpperCase() === TELE_VISIT_TYPE;

/** Merge API rows (user id + name/qualification/reg) over the fixed list. */
export const mergeTeleDoctorsFromApi = (apiRows = []) => {
  if (!Array.isArray(apiRows) || apiRows.length === 0) {
    return TELE_CONSULTATION_DOCTORS;
  }
  const byId = new Map(
    apiRows.map((r) => [
      Number(r.id ?? r.user_id ?? r.userId),
      {
        name: r.name || r.doctor_name || r.username || "",
        qualification: r.qualification || "",
        registration_number: r.registration_number || "",
      },
    ]),
  );
  return TELE_CONSULTATION_DOCTORS.map((d) => {
    const extra = byId.get(Number(d.userId)) || {};
    return {
      ...d,
      name: extra.name || d.name,
      qualification: extra.qualification || d.qualification || "",
      registration_number:
        extra.registration_number || d.registration_number || "",
    };
  });
};
