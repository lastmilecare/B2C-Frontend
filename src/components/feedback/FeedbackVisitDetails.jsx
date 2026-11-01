import React from "react";

/**
 * Inline visit/patient details panel (formerly FeedbackInfoModal content).
 * Used in Feedback Form Section 2 — right column.
 */
const FeedbackVisitDetails = ({ history, isLoading, compact = false }) => {
  const patient = history?.patient || {};

  return (
    <div
      className={`h-full text-sm ${compact ? "" : "space-y-5"}`}
    >
      {isLoading && (
        <p className="text-slate-500 px-1 py-2">Loading patient history…</p>
      )}

      {!isLoading && (
        <div className="space-y-5">
          <section>
            <h4 className="font-semibold text-slate-800 mb-2 text-xs uppercase tracking-wide">
              Patient details
            </h4>
            <div className="grid grid-cols-1 gap-1.5 text-slate-700 bg-slate-50 rounded-lg p-3 border border-slate-100">
              <div>
                <span className="text-slate-500">Name: </span>
                {patient.patient_name || "-"}
              </div>
              <div>
                <span className="text-slate-500">Age: </span>
                {patient.age ?? "-"}
                {patient.imonth != null || patient.idays != null
                  ? ` / ${patient.imonth ?? "-"} / ${patient.idays ?? "-"}`
                  : ""}
              </div>
              <div>
                <span className="text-slate-500">Gender: </span>
                {patient.gender || "-"}
              </div>
              <div>
                <span className="text-slate-500">Mobile: </span>
                {patient.mobile || "-"}
              </div>
              {patient.driver_id != null && (
                <div>
                  <span className="text-slate-500">Driver ID: </span>
                  {patient.driver_id}
                </div>
              )}
              {patient.health_card_number && (
                <div>
                  <span className="text-slate-500">Health card: </span>
                  {patient.health_card_number}
                </div>
              )}
              <div>
                <span className="text-slate-500">UHID: </span>
                {patient.uhid || "-"}
              </div>
              <div>
                <span className="text-slate-500">Address: </span>
                {patient.address || "-"}
              </div>
              <div>
                <span className="text-slate-500">Category: </span>
                {patient.category || "-"}
              </div>
            </div>
          </section>

          {history?.transporter && (
            <section>
              <h4 className="font-semibold text-slate-800 mb-2 text-xs uppercase tracking-wide">
                Transporter details
              </h4>
              <div className="grid grid-cols-1 gap-1.5 text-slate-700 bg-violet-50 rounded-lg p-3 border border-violet-100">
                <div>
                  <span className="text-slate-500">Name: </span>
                  {history.transporter.name || "-"}
                </div>
                {history.transporter.cet_id != null && (
                  <div>
                    <span className="text-slate-500">CET ID: </span>
                    {history.transporter.cet_id}
                  </div>
                )}
                {history.transporter.client_name && (
                  <div>
                    <span className="text-slate-500">Client: </span>
                    {history.transporter.client_name}
                  </div>
                )}
                {history.transporter.center_name && (
                  <div>
                    <span className="text-slate-500">Center: </span>
                    {history.transporter.center_name}
                  </div>
                )}
                {history.transporter.client_contact && (
                  <div>
                    <span className="text-slate-500">Contact: </span>
                    {history.transporter.client_contact}
                  </div>
                )}
              </div>
            </section>
          )}

          {(history?.visits || []).map((visit) => (
            <section
              key={visit.visit_key}
              className={`rounded-lg p-3 border ${
                visit.is_camp
                  ? "border-amber-200 bg-amber-50/60"
                  : "border-emerald-100 bg-emerald-50/50"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4
                  className={`font-semibold ${
                    visit.is_camp ? "text-amber-900" : "text-emerald-900"
                  }`}
                >
                  Visit {visit.visit_number}
                </h4>
                {visit.is_camp && (
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900">
                    CAMP
                  </span>
                )}
                {visit.is_kavach && (
                  <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-sky-200/80 text-sky-900">
                    KAVACH
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 gap-1.5 text-slate-700">
                {!visit.is_kavach && (
                  <div>
                    <span className="text-slate-500">Visit number: </span>
                    {visit.token ?? visit.visit_number}
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Visit date: </span>
                  {visit.visit_date || "-"}
                </div>
                {visit.is_kavach && visit.center_name && (
                  <div>
                    <span className="text-slate-500">Center: </span>
                    {visit.center_name}
                  </div>
                )}
                {visit.is_camp && visit.camp_date && (
                  <div>
                    <span className="text-slate-500">Camp date: </span>
                    {visit.camp_date}
                  </div>
                )}
                <div>
                  <span className="text-slate-500">
                    {history.chief_complaint_label || "Chief complaint"}:{" "}
                  </span>
                  {visit.chief_complaint || "-"}
                </div>
                <div>
                  <span className="text-slate-500">Doctor: </span>
                  {visit.doctor_name || "-"}
                </div>
                {visit.department_name && visit.department_name !== "-" && (
                  <div>
                    <span className="text-slate-500">Department: </span>
                    {visit.department_name}
                  </div>
                )}
                {visit.is_kavach && visit.vitals_summary && (
                  <div>
                    <span className="text-slate-500">Vitals: </span>
                    {visit.vitals_summary}
                  </div>
                )}
                {visit.is_kavach && visit.fitness_status && (
                  <div>
                    <span className="text-slate-500">Fitness: </span>
                    {visit.fitness_status}
                  </div>
                )}
                {!visit.is_kavach && (
                  <div>
                    <span className="text-slate-500">Bill No: </span>
                    {visit.bill_no || "-"}
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Prescribed medicines: </span>
                  {visit.prescribed_medicines || "-"}
                </div>
                <div>
                  <span className="text-slate-500">Lab/Diagnostic tests: </span>
                  {visit.lab_diagnostic_tests || "-"}
                </div>
                {visit.is_camp && (
                  <div>
                    <span className="text-slate-500">Camp pharmacy items: </span>
                    {visit.camp_pharmacy_items || "-"}
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Feedback received: </span>
                  {visit.feedback_received || "-"}
                </div>
              </div>
            </section>
          ))}

          {!(history?.visits || []).length && (
            <p className="text-slate-500">No visit history found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackVisitDetails;
