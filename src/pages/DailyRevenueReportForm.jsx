import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import { Input, Button } from "../components/UIComponents";
import {
  useCreateDailyRevenueReportMutation,
  useGetDailyRevenuePreviewMutation,
  useGetDailyRevenueReportQuery,
  useSendDailyRevenueReportMutation,
  useUpdateDailyRevenueReportMutation,
  useGetDailyRevenueReportPreviewQuery,
} from "../redux/apiSlice";
import { healthAlerts } from "../utils/healthSwal";
import { getApiErrorMessage } from "../utils/helper";

const IN_HOUSE_FIELDS = [
  { key: "general_consultation", label: "General consultation" },
  { key: "special_consultation", label: "Special consultation" },
  { key: "pharmacy", label: "Pharmacy" },
  { key: "xray", label: "X-Ray" },
  { key: "minor_procedure", label: "Minor procedure" },
];

const THIRD_PARTY_FIELDS = [
  { key: "dental_consultation", label: "Dental consultation" },
  { key: "physio_consultation", label: "Physio consultation" },
  { key: "dental_procedure", label: "Dental procedure" },
  { key: "physio_procedure", label: "Physio procedure" },
  { key: "lab", label: "Lab" },
  { key: "spectacles", label: "Spectacles" },
  { key: "b2b", label: "B2B" },
  { key: "dental_due", label: "Dental due" },
];

const emptyLines = (fields) =>
  Object.fromEntries(fields.map((f) => [f.key, ""]));

const initialForm = {
  report_date: new Date().toISOString().split("T")[0],
  opd: "",
  ipd: "",
  b2b_patients: "",
  in_house: emptyLines(IN_HOUSE_FIELDS),
  third_party: emptyLines(THIRD_PARTY_FIELDS),
};

const DailyRevenueReportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== "new");
  const [activeTab, setActiveTab] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [livePreview, setLivePreview] = useState(null);

  const { data: report, isLoading } = useGetDailyRevenueReportQuery(id, {
    skip: !isEdit,
  });

  const { data: savedPreview, isFetching: savedPreviewLoading } =
    useGetDailyRevenueReportPreviewQuery(id, {
      skip: !isEdit || activeTab !== 2,
    });

  const [fetchPreview, { isLoading: previewLoading }] =
    useGetDailyRevenuePreviewMutation();

  const [createReport, { isLoading: creating }] =
    useCreateDailyRevenueReportMutation();
  const [updateReport, { isLoading: updating }] =
    useUpdateDailyRevenueReportMutation();
  const [sendReport, { isLoading: sending }] =
    useSendDailyRevenueReportMutation();

  const buildPayload = () => ({
    report_date: form.report_date,
    opd: Number(form.opd) || 0,
    ipd: Number(form.ipd) || 0,
    b2b_patients: Number(form.b2b_patients) || 0,
    in_house: Object.fromEntries(
      Object.entries(form.in_house).map(([k, v]) => [k, Number(v) || 0]),
    ),
    third_party: Object.fromEntries(
      Object.entries(form.third_party).map(([k, v]) => [k, Number(v) || 0]),
    ),
  });

  useEffect(() => {
    if (report) {
      setForm({
        report_date: report.report_date,
        opd: report.opd ?? "",
        ipd: report.ipd ?? "",
        b2b_patients: report.b2b_patients ?? "",
        in_house: { ...emptyLines(IN_HOUSE_FIELDS), ...report.in_house },
        third_party: {
          ...emptyLines(THIRD_PARTY_FIELDS),
          ...report.third_party,
        },
      });
    }
  }, [report]);

  useEffect(() => {
    if (activeTab !== 2 || (isEdit && id)) {
      return;
    }

    const loadPreview = async () => {
      try {
        const result = await fetchPreview(buildPayload()).unwrap();
        setLivePreview(result);
      } catch (err) {
        healthAlerts.error(getApiErrorMessage(err, "Preview failed"), "Error");
      }
    };

    loadPreview();
  }, [activeTab, isEdit, id, form, fetchPreview]);

  const totalPatients = useMemo(() => {
    const a = Number(form.opd) || 0;
    const b = Number(form.ipd) || 0;
    const c = Number(form.b2b_patients) || 0;
    return a + b + c;
  }, [form.opd, form.ipd, form.b2b_patients]);

  const handleLineChange = (section, key, value) => {
    const numeric = value.replace(/[^0-9.]/g, "");
    setForm((prev) => ({
      ...prev,
      [section]: { ...prev[section], [key]: numeric },
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveDraft = async () => {
    const payload = buildPayload();
    try {
      if (isEdit) {
        await updateReport({ id, ...payload }).unwrap();
        healthAlerts.success("Report saved", "Updated");
      } else {
        const created = await createReport(payload).unwrap();
        healthAlerts.success("Report saved", "Created");
        navigate(`/daily-revenue-report/${created.id}`);
      }
    } catch (err) {
      healthAlerts.error(getApiErrorMessage(err, "Save failed"), "Error");
    }
  };

  const saveAndSend = async () => {
    try {
      let reportId = id;
      if (!isEdit) {
        const created = await createReport(buildPayload()).unwrap();
        reportId = created.id;
      } else {
        await updateReport({ id, ...buildPayload() }).unwrap();
      }
      await sendReport(reportId).unwrap();
      healthAlerts.success("Report sent to client", "Sent");
      navigate("/daily-revenue-report", { state: { goToList: true } });
    } catch (err) {
      healthAlerts.error(getApiErrorMessage(err, "Send failed"), "Error");
    }
  };

  const previewData = isEdit ? savedPreview : livePreview;
  const summary = previewData || report;

  if (isEdit && isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  const tabs = [
    { id: 1, label: "Report data" },
    { id: 2, label: "Preview & send" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex justify-between items-center mb-10 flex-wrap gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <CurrencyRupeeIcon className="w-6 h-6 text-blue-600" />
            </span>
            {isEdit ? "Edit daily revenue report" : "New daily revenue report"}
          </h1>
          <div className="flex gap-2">
            {tabs.map((t) => (
              <div
                key={t.id}
                className={`h-2 w-12 rounded-full ${
                  activeTab >= t.id ? "bg-sky-600" : "bg-blue-100"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
          <div className="flex border-b">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex-1 py-4 text-sm font-semibold ${
                  activeTab === t.id
                    ? "text-sky-600 border-b-2 border-sky-600"
                    : "text-gray-400"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-9 space-y-8">
            {activeTab === 1 && (
              <>
                <section className="bg-sky-50/40 p-6 rounded-xl border border-sky-100 space-y-6">
                  <h3 className="text-sky-700 font-semibold text-lg">
                    Reporting date
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <Input
                      label="Date"
                      name="report_date"
                      type="date"
                      value={form.report_date}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Total patient register"
                      name="total_patients"
                      value={totalPatients}
                      readOnly
                    />
                  </div>
                </section>

                <section className="bg-sky-50/40 p-6 rounded-xl border border-sky-100 space-y-6">
                  <h3 className="text-sky-700 font-semibold text-lg">
                    Patient registration
                  </h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    <Input
                      label="OPD"
                      name="opd"
                      type="number"
                      value={form.opd}
                      onChange={handleChange}
                    />
                    <Input
                      label="IPD"
                      name="ipd"
                      type="number"
                      value={form.ipd}
                      onChange={handleChange}
                    />
                    <Input
                      label="B2B"
                      name="b2b_patients"
                      type="number"
                      value={form.b2b_patients}
                      onChange={handleChange}
                    />
                  </div>
                </section>

                <div className="grid lg:grid-cols-2 gap-6">
                  <LineSection
                    title="In house revenue"
                    fields={IN_HOUSE_FIELDS}
                    section="in_house"
                    form={form}
                    onChange={handleLineChange}
                  />
                  <LineSection
                    title="Third party revenue"
                    fields={THIRD_PARTY_FIELDS}
                    section="third_party"
                    form={form}
                    onChange={handleLineChange}
                  />
                </div>

                {summary && <SummaryReadOnly summary={summary} />}
              </>
            )}

            {activeTab === 2 && (
              <div className="bg-sky-50 p-6 rounded-xl border space-y-4">
                <h3 className="font-semibold text-sky-700 flex items-center gap-2">
                  <ClipboardDocumentIcon className="w-5 h-5" />
                  Preview &amp; send
                </h3>
                {(previewLoading || savedPreviewLoading) && (
                  <p className="text-sm text-slate-500">Loading preview…</p>
                )}
                {previewData?.delivery && (
                  <DeliveryReadOnly delivery={previewData.delivery} />
                )}
                {summary && <SummaryReadOnly summary={summary} />}
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t flex-wrap gap-3">
              <Button
                type="button"
                variant="gray"
                onClick={() =>
                  navigate("/daily-revenue-report", { state: { goToList: true } })
                }
              >
                Cancel
              </Button>
              <div className="flex gap-3 flex-wrap">
                {activeTab === 1 && (
                  <Button
                    type="button"
                    variant="gray"
                    onClick={() => setForm(initialForm)}
                  >
                    <ArrowPathIcon className="w-5 h-5 inline mr-1" />
                    Reset
                  </Button>
                )}
                <Button
                  type="button"
                  variant="sky"
                  onClick={saveDraft}
                  disabled={creating || updating}
                >
                  Save draft
                </Button>
                <Button
                  type="button"
                  variant="sky"
                  onClick={saveAndSend}
                  disabled={creating || updating || sending}
                >
                  <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                  Save &amp; send to client
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LineSection = ({ title, fields, section, form, onChange }) => (
  <section className="bg-sky-50/40 p-6 rounded-xl border border-sky-100 space-y-4">
    <h3 className="text-sky-700 font-semibold text-lg">{title}</h3>
    <div className="grid sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <Input
          key={f.key}
          label={f.label}
          name={f.key}
          type="number"
          min="0"
          value={form[section][f.key]}
          onChange={(e) => onChange(section, f.key, e.target.value)}
        />
      ))}
    </div>
  </section>
);

const DeliveryReadOnly = ({ delivery }) => (
  <div className="text-sm bg-white rounded-lg border p-4 space-y-1">
    <p>
      <span className="text-slate-500 font-medium">To: </span>
      {delivery.client_email || (
        <span className="text-red-600">
          Not set — save in opening balance settings
        </span>
      )}
    </p>
    {delivery.email_cc && (
      <p>
        <span className="text-slate-500 font-medium">CC: </span>
        {delivery.email_cc}
      </p>
    )}
    <p>
      <span className="text-slate-500 font-medium">Subject: </span>
      {delivery.email_subject}
    </p>
  </div>
);

const SummaryReadOnly = ({ summary }) => (
  <section className="bg-slate-50 p-6 rounded-xl border border-slate-200">
    <h3 className="font-semibold text-slate-700 mb-4">Summary (read-only)</h3>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-xs text-slate-500">
          <th className="pb-2" />
          <th>Previous</th>
          <th>Today</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-t">
          <td className="py-2 font-medium">Month revenue</td>
          <td>{summary.month_previous}</td>
          <td>{summary.month_today ?? summary.revenue_today}</td>
          <td className="font-bold">{summary.month_total}</td>
        </tr>
        <tr className="border-t">
          <td className="py-2 font-medium">Cumulative</td>
          <td>{summary.cumulative_previous}</td>
          <td>{summary.cumulative_today ?? summary.revenue_today}</td>
          <td className="font-bold">{summary.cumulative_total}</td>
        </tr>
      </tbody>
    </table>
  </section>
);

export default DailyRevenueReportForm;
