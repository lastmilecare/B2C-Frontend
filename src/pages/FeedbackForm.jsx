import React, { useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  DocumentCheckIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  useGetFeedbackVisitQuery,
  useGetFeedbackPatientHistoryQuery,
  useSaveFeedbackMutation,
} from "../redux/apiSlice";
import FeedbackVisitDetails from "../components/feedback/FeedbackVisitDetails";
import FeedbackQuestionGroup from "../components/feedback/FeedbackQuestionGroup";
import { CALL_STATUS } from "../constants/feedbackQuestions";
import { healthAlert } from "../utils/healthSwal";
import GlobalLoader from "../components/common/GlobalLoader";
import { Input, Button } from "../components/FormControls";

const readOnlyFieldClass =
  "bg-sky-50 cursor-default text-sm py-1.5 min-h-0 leading-snug";

const formatAnswer = (r) => {
  if (!r?.answer) return "-";
  if (r.answer === "Other" && r.otherText) {
    return `Other: ${r.otherText}`;
  }
  return r.answer;
};

const FeedbackForm = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const visitKeyFromPath = params["*"] || params.visitKey || "";
  const visitKey =
    decodeURIComponent(visitKeyFromPath) ||
    location.state?.visitKey ||
    "";

  const { data: visitData, isLoading, isError } = useGetFeedbackVisitQuery(
    visitKey,
    { skip: !visitKey },
  );

  const historyQueryArg = React.useMemo(() => {
    if (!visitData) return null;
    if (visitData.is_kavach || visitData.source === "kavach") {
      const driverId =
        visitData.driver_id ||
        visitData.patient?.driver_id ||
        visitData.patient?.patient_id;
      if (!driverId) return null;
      return {
        patient_id: driverId,
        driver_id: driverId,
        source: "kavach",
      };
    }
    const pid = visitData.patient?.patient_id;
    return pid || null;
  }, [visitData]);

  const { data: history, isLoading: historyLoading } =
    useGetFeedbackPatientHistoryQuery(historyQueryArg, {
      skip: !historyQueryArg,
    });

  const [saveFeedback, { isLoading: saving }] = useSaveFeedbackMutation();
  const [activeStep, setActiveStep] = useState(1);
  const [callStatus, setCallStatus] = useState("");
  const [responses, setResponses] = useState({});

  const questions = useMemo(
    () => (Array.isArray(visitData?.questions) ? visitData.questions : []),
    [visitData],
  );

  const isCamp = Boolean(
    visitData?.is_camp ||
      visitData?.source === "camp" ||
      location.state?.row?.is_camp,
  );

  const handleResponseChange = (key, value) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const validateResponses = () => {
    for (const q of questions) {
      const r = responses[q.key];
      if (!r?.answer) {
        return `Please answer: ${q.text}`;
      }
      if (r.answer === "Other" && !String(r.otherText || "").trim()) {
        return `Please specify "Other" for: ${q.text}`;
      }
    }
    return null;
  };

  const buildPayload = (connected, withResponses) => {
    const visit = visitData?.visit || {};
    const patient = visitData?.patient || {};
    const row = location.state?.row || {};

    return {
      patient_id: patient.patient_id || row.patient_id,
      visit_key: visitKey,
      source: visitData?.source || row.source || (isCamp ? "camp" : "opd"),
      uhid: patient.uhid || row.uhid,
      visit_date: visit.visit_date || row.visit_date,
      primary_bill_no: visit.primary_bill_no || row.primary_bill_no,
      bill_nos: row.bill_nos
        ? Array.isArray(row.bill_nos)
          ? row.bill_nos.join(",")
          : row.bill_nos
        : Array.isArray(visit.bill_nos)
          ? visit.bill_nos.join(",")
          : visit.bill_no,
      token: visit.token || row.token,
      center_id:
        row.center_id ||
        visitData?.center_id ||
        visitData?.patient?.center_id,
      consultation_id:
        row.consultation_id ||
        visitData?.consultation_id,
      driver_id:
        row.driver_id ||
        visitData?.driver_id ||
        visitData?.patient?.driver_id,
      call_status: connected ? CALL_STATUS.CONNECTED : CALL_STATUS.NOT_CONNECTED,
      responses: withResponses ? responses : undefined,
      is_feedback_completed: connected && withResponses,
    };
  };

  const handleSaveNotConnected = async () => {
    if (!callStatus) {
      healthAlert({
        title: "Feedback",
        text: "Please select call status.",
        icon: "info",
      });
      return;
    }
    try {
      await saveFeedback(buildPayload(false, false)).unwrap();
      healthAlert({
        title: "Saved",
        text: "Call attempt recorded.",
        icon: "success",
      });
      navigate("/feedback-list");
    } catch (err) {
      healthAlert({
        title: "Error",
        text: err?.data?.message || "Failed to save feedback.",
        icon: "error",
      });
    }
  };

  const goToQuestions = () => {
    if (!callStatus) {
      healthAlert({
        title: "Feedback",
        text: "Please select call status.",
        icon: "info",
      });
      return;
    }
    if (callStatus === CALL_STATUS.NOT_CONNECTED) {
      handleSaveNotConnected();
      return;
    }
    setActiveStep(2);
  };

  const goToConfirm = () => {
    const err = validateResponses();
    if (err) {
      healthAlert({ title: "Feedback", text: err, icon: "info" });
      return;
    }
    setActiveStep(3);
  };

  const handleSubmit = async () => {
    try {
      await saveFeedback(buildPayload(true, true)).unwrap();
      healthAlert({
        title: "Saved",
        text: "Feedback submitted successfully.",
        icon: "success",
      });
      navigate("/feedback-list");
    } catch (e) {
      healthAlert({
        title: "Error",
        text: e?.data?.message || "Failed to submit feedback.",
        icon: "error",
      });
    }
  };

  const prevStep = () => setActiveStep((s) => Math.max(1, s - 1));

  const handlePrimary = () => {
    if (activeStep === 1) goToQuestions();
    else if (activeStep === 2) goToConfirm();
    else handleSubmit();
  };

  if (!visitKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10 px-8">
        <p className="text-slate-600 max-w-[1400px] mx-auto">
          Missing visit reference. Open a visit from the Feedback List.
        </p>
      </div>
    );
  }

  if (isLoading) return <GlobalLoader />;

  if (isError || !visitData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10 px-8">
        <p className="text-red-600 max-w-[1400px] mx-auto">
          Unable to load feedback form for this visit.
        </p>
      </div>
    );
  }

  const patient = visitData.patient || {};
  const visit = visitData.visit || {};
  const chiefLabel = visitData.chief_complaint_label || "Chief Complaint";
  const alreadyCompleted = Boolean(visitData.is_feedback_completed);
  const ageDisplay = [patient.age, patient.imonth, patient.idays]
    .filter((v) => v !== null && v !== undefined && v !== "")
    .join(" / ");

  const primaryActionLabel =
    activeStep === 1
      ? callStatus === CALL_STATUS.NOT_CONNECTED
        ? "Save"
        : "Continue"
      : activeStep === 2
        ? "Continue"
        : "Save";

  const primaryVariant = activeStep === 3 ? "green" : "sky";

  const steps = [
    { id: 1, label: "Patient", icon: UserIcon },
    { id: 2, label: "Feedback", icon: ChatBubbleLeftRightIcon },
    { id: 3, label: "Confirm", icon: DocumentCheckIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/feedback-list")}
              className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
              title="Back to Feedback List"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <span className="bg-blue-100 p-2 rounded-xl">
                <PhoneIcon className="w-6 h-6 text-blue-600" />
              </span>
              Feedback Form
            </h1>
            {isCamp && (
              <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-800 bg-amber-100 px-2 py-1 rounded">
                CAMP
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {steps.map((s) => (
              <div
                key={s.id}
                className={`h-2 w-12 rounded-full transition-colors ${
                  activeStep >= s.id ? "bg-sky-600" : "bg-blue-100"
                }`}
              />
            ))}
          </div>
        </div>

        {alreadyCompleted && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-900 shadow-sm">
            Feedback is already completed for this visit. Review details in
            Section 2; new submissions are not allowed.
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="flex border-b">
            {steps.map((stepItem) => (
              <button
                key={stepItem.id}
                type="button"
                disabled
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-semibold transition-colors
                  ${
                    activeStep === stepItem.id
                      ? "bg-white text-sky-600 shadow-sm"
                      : "text-gray-400 bg-gray-50/50"
                  }`}
              >
                <stepItem.icon className="w-4 h-4" />
                {stepItem.label}
              </button>
            ))}
          </div>

          <form
            className="space-y-6 p-8"
            onSubmit={(e) => {
              e.preventDefault();
              handlePrimary();
            }}
          >
            {activeStep === 1 && (
              <section>
                <div className="flex items-center gap-2 mb-5 pb-2 border-b border-gray-100">
                  <ClipboardDocumentIcon className="w-5 h-5 text-sky-600" />
                  <h2 className="text-md font-semibold text-gray-700">
                    Section 1 – Patient Details
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  <Input
                    label="Patient Name"
                    value={patient.patient_name || "-"}
                    readOnly
                    className={readOnlyFieldClass}
                  />
                  <Input
                    label="Age"
                    value={ageDisplay || "-"}
                    readOnly
                    className={readOnlyFieldClass}
                  />
                  <Input
                    label="Category"
                    value={patient.category || "-"}
                    readOnly
                    className={readOnlyFieldClass}
                  />
                  <Input
                    label="Gender"
                    value={patient.gender || "-"}
                    readOnly
                    className={readOnlyFieldClass}
                  />
                  <Input
                    label="Mobile"
                    value={patient.mobile || "-"}
                    readOnly
                    className={readOnlyFieldClass}
                  />
                  {!visitData?.is_kavach && (
                    <Input
                      label="UHID"
                      value={patient.uhid || "-"}
                      readOnly
                      className={readOnlyFieldClass}
                    />
                  )}
                  {visitData?.is_kavach && (
                    <>
                      <Input
                        label="Driver ID"
                        value={patient.driver_id ?? patient.patient_id ?? "-"}
                        readOnly
                        className={readOnlyFieldClass}
                      />
                      <Input
                        label="Health Card Number"
                        value={patient.health_card_number || "-"}
                        readOnly
                        className={readOnlyFieldClass}
                      />
                      <Input
                        label="Driving Licence"
                        value={patient.driving_licence || "-"}
                        readOnly
                        className={readOnlyFieldClass}
                      />
                    </>
                  )}
                  <Input
                    label="Visit Date"
                    value={visit.visit_date || visit.added_date || "-"}
                    readOnly
                    className={readOnlyFieldClass}
                  />
                  {!visitData?.is_kavach && (
                    <Input
                      label="Bill No"
                      value={visit.bill_no || "-"}
                      readOnly
                      className={readOnlyFieldClass}
                    />
                  )}
                  <Input
                    label="Address"
                    value={patient.address || "-"}
                    readOnly
                    className={readOnlyFieldClass}
                    title={patient.address || ""}
                  />
                  <Input
                    label={chiefLabel}
                    value={visitData.chief_complaint || "-"}
                    readOnly
                    className={readOnlyFieldClass}
                    title={visitData.chief_complaint || ""}
                  />
                  <Input
                    label={
                      visit.doctor_label ||
                      (visitData?.is_kavach ? "Qualification" : "Doctor")
                    }
                    value={
                      visitData?.is_kavach
                        ? visit.doctor_qualification || visit.doctor_name || "-"
                        : visit.doctor_name || "-"
                    }
                    readOnly
                    className={readOnlyFieldClass}
                  />
                  {visitData?.is_kavach && visit.doctor_name && (
                    <Input
                      label="Doctor"
                      value={visit.doctor_name}
                      readOnly
                      className={readOnlyFieldClass}
                    />
                  )}

                  <div className="col-span-2 md:col-span-2 lg:col-span-3">
                    <p className="text-sm text-gray-600 mb-1">
                      Call Status <span className="text-red-500">*</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[CALL_STATUS.CONNECTED, CALL_STATUS.NOT_CONNECTED].map(
                        (opt) => (
                          <label
                            key={opt}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer
                              ${
                                callStatus === opt
                                  ? "border-sky-500 bg-sky-50 text-sky-800"
                                  : "border-gray-300 bg-white text-gray-600 hover:border-sky-300"
                              }
                              ${alreadyCompleted ? "opacity-50 pointer-events-none" : ""}`}
                          >
                            <input
                              type="radio"
                              name="callStatus"
                              value={opt}
                              checked={callStatus === opt}
                              onChange={() => setCallStatus(opt)}
                              disabled={alreadyCompleted}
                              className="text-sky-600 w-3.5 h-3.5"
                            />
                            {opt}
                          </label>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeStep === 2 && (
              <section>
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-sky-600" />
                  <h2 className="text-md font-semibold text-gray-700">
                    Section 2 – Feedback Questions &amp; Details
                  </h2>
                </div>

                {/* Split layout: questions | details — independent scroll */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-5">
                  <div className="lg:col-span-3 flex flex-col min-h-0 border border-gray-200 rounded-xl overflow-hidden bg-slate-50/40">
                    <div className="px-4 py-2.5 border-b border-gray-200 bg-white">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                        Questions
                      </p>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[min(62vh,560px)] p-4 space-y-4">
                      {questions.map((q) => (
                        <FeedbackQuestionGroup
                          key={q.key}
                          question={q}
                          value={responses[q.key]}
                          onChange={handleResponseChange}
                          disabled={alreadyCompleted}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex flex-col min-h-0 border border-sky-100 rounded-xl overflow-hidden bg-sky-50/30">
                    <div className="px-4 py-2.5 border-b border-sky-100 bg-white">
                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                        Details
                      </p>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[min(62vh,560px)] p-4">
                      <FeedbackVisitDetails
                        history={history}
                        isLoading={historyLoading}
                        compact
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeStep === 3 && (
              <section>
                <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 space-y-4 max-w-4xl">
                  <h3 className="text-base font-semibold text-sky-600">
                    FEEDBACK PREVIEW
                  </h3>

                  <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800">
                    <p>
                      <span className="text-gray-500">Patient:</span>{" "}
                      {patient.patient_name || "-"}
                      {isCamp && (
                        <span className="ml-2 text-[9px] font-semibold tracking-wider uppercase text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          CAMP
                        </span>
                      )}
                    </p>
                    <p>
                      <span className="text-gray-500">UHID:</span>{" "}
                      {patient.uhid || "-"}
                    </p>
                    <p>
                      <span className="text-gray-500">Mobile:</span>{" "}
                      {patient.mobile || "-"}
                    </p>
                    <p>
                      <span className="text-gray-500">Visit date:</span>{" "}
                      {visit.visit_date || visit.added_date || "-"}
                    </p>
                    <p className="md:col-span-2">
                      <span className="text-gray-500">Call status:</span>{" "}
                      <span className="font-medium">{callStatus || "-"}</span>
                    </p>
                  </div>

                  <div className="border-t border-blue-200 pt-3 space-y-2 text-sm">
                    <p className="font-medium text-gray-700">Responses</p>
                    {questions.map((q) => (
                      <p key={q.key}>
                        <span className="text-gray-500">{q.text}</span>
                        <br />
                        <span className="font-medium text-gray-800">
                          {formatAnswer(responses[q.key])}
                        </span>
                      </p>
                    ))}
                  </div>
                </div>
              </section>
            )}

            <div className="flex flex-wrap justify-between items-center gap-3 pt-5 border-t border-gray-100">
              <div className="flex gap-2">
                {activeStep > 1 && (
                  <Button type="button" variant="gray" onClick={prevStep}>
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/feedback-list")}
                >
                  Cancel
                </Button>
              </div>

              <Button
                type="submit"
                variant={primaryVariant}
                disabled={saving || alreadyCompleted}
                className="inline-flex items-center gap-2 min-w-[120px] justify-center"
              >
                <CheckCircleIcon className="w-4 h-4" />
                {saving ? "Saving..." : primaryActionLabel}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
