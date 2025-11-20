import React, { forwardRef } from "react";

const PrescriptionPrint = forwardRef(({ data }, ref) => {

    const followUpDate = data?.follow_up ? new Date(data.follow_up) : null;
    const today = new Date();

    let followup_days = "-";
    if (followUpDate) {
        const diffMs = followUpDate - today;
        followup_days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }

    return (
        <div
            ref={ref}
            style={{
                width: "210mm",
                minHeight: "297mm",
                padding: "12mm 15mm",
                fontFamily: "Arial, sans-serif",
                fontSize: "13px",
                color: "#000",
                lineHeight: "1.45",
            }}
        >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <h2 style={{ color: "#00397A", margin: 0, fontWeight: "800" }}>MEDI KAVACH</h2>
                <h3 style={{ color: "#4A6FA1", margin: 0, fontWeight: "600" }}>HEALTH CENTRE</h3>
                <p style={{ fontSize: "11px", color: "#4A6FA1" }}>
                    Address: Demo Road, Demo City • Phone: +91-9876543210
                </p>
            </div>

            <hr style={{ margin: "5px 0", borderColor: "#00397A" }} />

            {/* Basic */}
            <div><b>Date:</b> {data?.createdAt || "-"}</div>

            <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0" }}>
                <div><b>Bill No:</b> {data?.bill_no || "-"}</div>
                <div><b>UHID:</b> {data?.uhid || "-"}</div>
            </div>

            {/* Patient & Doctor */}
            <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0" }}>
                <h3 style={sectionTitle}>PATIENT DETAILS</h3>
                <h3 style={sectionTitle}>DOCTOR DETAILS</h3>
            </div>

            <table style={table}>
                <tbody>
                    <tr>
                        <td style={td}><b>Name:</b> {data?.patient_name || "-"}</td>
                        <td style={td}><b>Doctor:</b> {data?.doctor_name || "-"}</td>
                    </tr>
                    <tr>
                        <td style={td}><b>Age:</b> {data?.age || "-"}</td>
                        <td style={td}><b>Qualification:</b> {data?.qualification || "-"}</td>
                    </tr>
                    <tr>
                        <td style={td}><b>Gender:</b> {data?.gender || "-"}</td>
                        <td style={td}><b>Reg No:</b> {data?.registration_number || "-"}</td>
                    </tr>
                    <tr>
                        <td style={td}><b>Contact:</b> {data?.contactNumber || "-"}</td>
                        <td style={td}><b>Category:</b> {data?.category || "-"}</td>
                    </tr>
                </tbody>
            </table>

            {/* Vitals */}
            <h3 style={sectionTitle}>VITALS</h3>
            <table style={tableBordered}>
                <thead>
                    <tr>
                        {["BP (Sys)", "BP (Dia)", "Pulse", "SpO₂", "Temp", "Height", "Weight"].map(h => (
                            <th key={h} style={th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={tdCenter}>{data?.vitals?.systolicBP || "-"}</td>
                        <td style={tdCenter}>{data?.vitals?.diastolicBP || "-"}</td>
                        <td style={tdCenter}>{data?.vitals?.pulse || "-"}</td>
                        <td style={tdCenter}>{data?.vitals?.spo2 || "-"}</td>
                        <td style={tdCenter}>{data?.vitals?.temperature || "-"}</td>
                        <td style={tdCenter}>{data?.vitals?.height || "-"}</td>
                        <td style={tdCenter}>{data?.vitals?.weight || "-"}</td>
                    </tr>
                </tbody>
            </table>

            {/* Medicines */}
            <h3 style={sectionTitle}>PRESCRIBED MEDICINES</h3>
            <table style={tableBordered}>
                <thead>
                    <tr>
                        {["S.no", "Name", "Type", "Dosage", "Instruction", "Time", "Days"].map(h => (
                            <th key={h} style={th}>{h}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data?.medicines?.length > 0 ? (
                        data.medicines.map((m, i) => (
                            <tr key={i}>
                                <td style={tdCenter}>{i + 1}</td>
                                <td style={tdCenter}>{m.medicine_name}</td>
                                <td style={tdCenter}>{m.type}</td>
                                <td style={tdCenter}>{m.dosage}</td>
                                <td style={tdCenter}>{m.instructions}</td>
                                <td style={tdCenter}>{m.frequency}</td>
                                <td style={tdCenter}>{m.duration}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td style={tdCenter} colSpan={6}>No medicines added</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Chief Complaints */}
            <h3 style={sectionTitle}>CHIEF COMPLAINTS</h3>
            <div style={{ minHeight: "40px" }}>
                {data?.chief_complaints?.length > 0
                    ? data.chief_complaints.map((t, i) => <div key={i}>• {t}</div>)
                    : "No Complaints"}
            </div>

            {/* Lab Tests */}
            <h3 style={sectionTitle}>LAB TESTS</h3>
            <div style={{ marginBottom: "20px" }}>
                {data?.lab?.length > 0
                    ? data.lab.map((t, i) => <div key={i}>• {t}</div>)
                    : "No Lab Tests"}
            </div>

            {/* Other Lab */}
            <h3 style={sectionTitle}>OTHER LAB</h3>
            <div style={{ marginBottom: "20px" }}>
                {data?.other_lab
                    ? <div>• {data.other_lab}</div>
                    : "No Other Lab"}
            </div>

            {/* Follow-up */}
            <div style={{ marginTop: "20px" }}>
                <b>Follow-up After:</b> {followup_days} Days
            </div>

            {/* Preventive Advice */}
            <h3 style={sectionTitle}>PREVENTIVE ADVICE</h3>
            <div style={{ minHeight: "40px" }}>
                {data?.preventive_advice?.length > 0
                    ? data.preventive_advice.map((t, i) => <div key={i}>• {t}</div>)
                    : "N/A"}
            </div>

            {/* Signature */}
            <div style={{ textAlign: "right", marginTop: "60px", fontWeight: "bold" }}>
                Doctor's Signature
            </div>

        </div>
    );
});

const sectionTitle = {
    marginTop: "20px",
    marginBottom: "8px",
    fontSize: "15px",
    fontWeight: "bold",
    color: "#00397A",
    borderBottom: "1px solid #4A6FA1",
    paddingBottom: "4px"
};

const table = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "10px",
};

const tableBordered = {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #000",
    marginBottom: "10px",
};

const td = {
    border: "1px solid #000",
    padding: "5px",
};

const tdCenter = {
    border: "1px solid #000",
    padding: "5px",
    textAlign: "center",
};

const th = {
    border: "1px solid #000",
    padding: "6px",
    background: "#EDF5FF",
    fontWeight: "bold",
    textAlign: "center",
};

export default PrescriptionPrint;



// old rpoject theme code
/*
import React, { forwardRef } from "react";

const PrescriptionPrint = forwardRef(({ data }, ref) => {

    const followUpDate = data?.follow_up ? new Date(data.follow_up) : null;
    const today = new Date();

    let followup_days = "-";

    if (followUpDate) {
        const diffMs = followUpDate - today;
        followup_days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    }
    return (
        <div
            ref={ref}
            style={{
                width: "210mm",
                minHeight: "297mm",
                padding: "12mm 15mm",
                fontFamily: "Arial, sans-serif",
                fontSize: "13px",
                color: "#000",
                lineHeight: "1.4",
            }}
        >
            <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <h2 className="text-[18px] font-extrabold text-[#00397A]">MEDI KAVACH</h2>
                <h3 className="text-[14px] font-semibold text-[#4A6FA1]">HEALTH CENTRE</h3>
                <p className="text-[11px] text-[#4A6FA1]">
                    Address: Demo Road, Demo City, Phone: +91-9876543210
                </p>
            </div>

            <hr style={{ margin: "5px 0" }} />

            <div><b>Date:</b> {data?.createdAt || "-"}</div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0" }}>

                <div><b>Bill No:</b> {data?.bill_no || "-"}</div>
                <div><b>Patient UHID :</b> {data?.uhid || "-"}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "10px 0" }}>

                <div><h3 style={sectionTitle}>PATIENT DETAILS</h3></div>
                <div><h3 style={sectionTitle}>DOCTOR DETAILS</h3></div>
            </div>
            <table style={table}>
                <tbody>
                    <tr>
                        <td style={td}><b>Name:</b> {data?.patient_name || "-"}</td>
                        <td style={td}><b>Doctor Name:</b> {data?.doctor_name || "-"}</td>
                    </tr>
                    <tr>
                        <td style={td}><b>Age:</b> {data?.age || "-"}</td>
                        <td style={td}><b>Qualification of Doctor:</b> {data?.qualification || "-"}</td>
                    </tr>
                    <tr>
                        <td style={td}><b>Gender:</b> {data?.gender || "-"}</td>
                        <td style={td}><b>Registration No. of Doctor:</b> {data?.registration_number || "-"}</td>
                    </tr>
                    <tr>
                        <td style={td}><b>Contact No:</b> {data?.contactNumber || "-"}</td>
                        <td style={td}><b>Patient Fin. Category:</b> {data?.category || "-"}</td>
                    </tr>
                </tbody>
            </table>
            <h3 style={sectionTitle}>VITALS</h3>

            <table style={tableBordered}>
                <thead>
                    <tr>
                        {["BP(systolic)", "BP(diastolic)", "Pulse Rate", "SPO2", "Temp", "Height", "Weight"].map(h => (
                            <th key={h} style={th}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td style={tdCenter}>{data?.vitals?.systolicBP || "-"}</td>
                        <td style={tdCenter}>{data?.vitals?.diastolicBP || "-"}</td>
                        <td style={tdCenter}>{data?.vitals?.pulse || "-"}</td>
                        <td style={tdCenter}>{data?.vitals?.spo2 || "-"}</td>
                        <td style={tdCenter}>{data?.vitals?.temperature || "-"}</td>
                        <td style={tdCenter}>{data?.vitals?.height || "-"}</td>
                        <td style={tdCenter}>{data?.vitals?.weight || "-"}</td>
                    </tr>
                </tbody>
            </table>
            <h3 style={sectionTitle}>PRESCRIBED MEDICINES</h3>

            <table style={tableBordered}>
                <thead>
                    <tr>
                        {["Name", "Type", "Dosage", "Instruction", "Time", "Days"].map(h => (
                            <th key={h} style={th}>{h}</th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data?.medicines?.length > 0 ? (
                        data.medicines.map((m, i) => (
                            <tr key={i}>
                                <td style={tdCenter}>{m.name}</td>
                                <td style={tdCenter}>{m.type}</td>
                                <td style={tdCenter}>{m.dosage}</td>
                                <td style={tdCenter}>{m.instruction}</td>
                                <td style={tdCenter}>{m.time}</td>
                                <td style={tdCenter}>{m.days}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td style={tdCenter} colSpan={6}>No medicines added</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <h3 style={sectionTitle}>Other Instructions</h3>
            <div style={{ minHeight: "40px" }}>{data?.complaints || "N/A"}</div>

            <h3 style={sectionTitle}>CHIEF COMPLAINTS</h3>
            <div style={{ minHeight: "40px" }}>{
                data?.chief_complaints?.length > 0
                    ? data.chief_complaints.map((t, i) => <div key={i}>• {t}</div>)
                    : "No Lab Tests"
            }</div>

            <h3 style={sectionTitle}>LAB TESTS</h3>

            <div style={{ marginBottom: "20px" }}>
                {data?.lab?.length > 0
                    ? data.lab.map((t, i) => <div key={i}>• {t}</div>)
                    : "No Lab Tests"}
            </div>
            <h3 style={sectionTitle}>Other Labs</h3>
            <div style={{ marginBottom: "20px" }}>
                {data?.other_lab?.length > 0
                    ? data.other_lab.map((t, i) => <div key={i}>• {t}</div>)
                    : "No Lab Tests"}
            </div>
            <div style={{ marginTop: "20px" }}>
                <b>Follow-up After:</b> {followup_days || "-"} Days
            </div>

            <div style={{ marginTop: "20px" }}>
                <b>Prevantive Advice:</b>{data?.preventive_advice?.length > 0
                    ? data.preventive_advice.map((t, i) => <div key={i}>• {t}</div>)
                    : "N/A"}
            </div>


            <div style={{ marginTop: "20px" }}>
                <b>History:</b> {data?.followup_days || "-"} Days
            </div> 

         
            <div style={{ textAlign: "right", marginTop: "60px" }}>
                <b>Doctor's Signature</b>
            </div>
        </div>
    );
});


const sectionTitle = {
    marginTop: "20px",
    marginBottom: "8px",
    fontSize: "15px",
    fontWeight: "bold",
};

const table = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "10px",
};

const tableBordered = {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #000",
};

const td = {
    border: "1px solid #000",
    padding: "5px",
};

const tdCenter = {
    border: "1px solid #000",
    padding: "5px",
    textAlign: "center",
};

const th = {
    border: "1px solid #000",
    padding: "6px",
    background: "#eee",
    fontWeight: "bold",
    textAlign: "center",
};

export default PrescriptionPrint;
*/