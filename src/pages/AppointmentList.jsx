import React, { useState, useEffect } from "react";
import PatientTable from "../components/Updates/PatientTable";
import CopyFilterBar from "../components/Updates/Filter";
import { useNavigate } from "react-router-dom";
import { useGetAppointmentsQuery, useGetComboQuery, useDeleteAppointmentMutation } from "../redux/apiSlice";
import { healthAlert, healthAlerts } from "../utils/healthSwal";
import { useLocation } from "react-router-dom";
import { formatDate, formatTime } from "../utils/dateTime";
const AppointmentList = () => {
    const navigate = useNavigate();
    const { data: doctors = [] } = useGetComboQuery("doctor");
    const { data, isLoading } = useGetAppointmentsQuery();
    const [deleteAppointment, { isLoading: deleteLoading }] =
        useDeleteAppointmentMutation();
    const appointments = data?.map((item) => {
        const doc = doctors.find((d) => d.id === item.doctor_id);

        return {
            id: item.id,
            employeeId: item.employee_id,
            patientId: item.patient_id,
            name: item.name,
            gender: item.gender,
            age: item.age,
            // appointment_datetime: item.appointment_datetime,
            appointmentDate: formatDate(item.appointment_datetime),
            appointmentTime: formatTime(item.appointment_datetime),

            doctor: doc ? (doc.name || doc.doctor_name) : "-",
            doctorId: item.doctor_id,

            location: item.ohc_location,
            status: item.status,

            visitType: item.visit_type || "",
            tokenNumber: item.token_number || "",
            remark: item.remark || "",

            checkIn: formatTime(item.check_in_time),
            checkOut: formatTime(item.check_out_time),
        };
    }) || [];
    const [tempFilters, setTempFilters] = useState({
        patientId: "",
        name: "",
        doctor: "",
        location: "",
        status: "",
        startDate: "",
        endDate: "",
    });

    const [filters, setFilters] = useState({});
    const location = useLocation();

    useEffect(() => {
        if (location.state?.goToList) {
            setFilters({});
            setTempFilters({
                patientId: "",
                name: "",
                doctor: "",
                location: "",
                status: "",
                startDate: "",
                endDate: "",
            });
        }
    }, [location.state]);
    const handleChange = (e) => {
        const { name, value } = e.target;

        setTempFilters((prev) => ({
            ...prev,
            [name]: value,
        }));
    };


    const handleApplyFilters = () => {
        setFilters(tempFilters);
    };


    const handleResetFilters = () => {
        const reset = {
            patientId: "",
            name: "",
            doctor: "",
            location: "",
            status: "",
            startDate: "",
            endDate: "",
        };
        setTempFilters(reset);
        setFilters({});
    };

    const handleDelete = async (row) => {
        try {

            const result = await healthAlert({
                title: "Delete Appointment?",
                text: "Are you sure you want to delete this appointment?",
                type: "confirm",
            });


            if (!result.isConfirmed) return;


            await deleteAppointment(row.id).unwrap();


            await healthAlerts.success("Appointment deleted successfully");

        } catch (err) {

            await healthAlerts.error(
                err?.data?.message || "Failed to delete appointment"
            );
        }
    };
    const filteredAppointments = appointments.filter((item) => {
       const { patientId, name, doctor, location, status, startDate, endDate } = filters;


        return (
            (!patientId || item.patientId?.toString().includes(patientId)) &&
            (!name || item.name?.toLowerCase().includes(name.toLowerCase())) &&
            (!doctor || item.doctor === doctor) &&
            (!location || item.location === location) &&
            (!status || item.status === status) &&
            (!startDate || item.appointmentDate >= startDate) &&
            (!endDate || item.appointmentDate <= endDate)
        );
    });


    const filtersConfig = [
        {
            label: "Patient ID",
            name: "patientId",
            type: "text",
        },
        {
            label: "Name",
            name: "name",
            type: "text",
        },
        {
            label: "Doctor",
            name: "doctor",
            type: "select",
            options: doctors.map((d) => ({
                label: d.name || d.doctor_name,
                value: d.name || d.doctor_name,
            })),
        },
        {
            label: "Location",
            name: "location",
            type: "select",
            options: [
                { label: "Noida OHC", value: "Noida OHC" },
                { label: "Delhi OHC", value: "Delhi OHC" },
                { label: "Plant Site", value: "Plant Site" },
            ],
        },
        {
            label: "Status",
            name: "status",
            type: "select",
            options: [
                { label: "Scheduled", value: "Scheduled" },
                { label: "Completed", value: "Completed" },
                { label: "Pending", value: "Pending" },
            ],
        },
        {
            label: "Date From",
            name: "startDate",
            type: "date",
        },
        {
            label: "Date To",
            name: "endDate",
            type: "date",
        },
    ];


    const columns = [
        {
            name: "Patient ID",
            selector: (row) => row.patientId,
        },
        {
            name: "Name",
            selector: (row) => row.name,
        },
        {
            name: "Date",
            selector: (row) => row.appointmentDate,
        },
        {
            name: "Time",
            selector: (row) => row.appointmentTime,
        },
        {
            name: "Doctor",
            selector: (row) => row.doctor,
        },
        {
            name: "Location",
            selector: (row) => row.location,
        },
        {
            name: "Status",
            cell: (row) => (
                <span
                    className={`px-2 py-1 text-xs rounded-full font-semibold
            ${row.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : row.status === "Pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                        }
          `}
                >
                    {row.status}
                </span>
            ),
        },
    ];

    return (
        <div className="max-w-7xl mx-auto">

            <h1 className="text-2xl font-semibold text-gray-700 mb-6">
                Appointment List
            </h1>


            <CopyFilterBar
                filtersConfig={filtersConfig}
                tempFilters={tempFilters}
                onChange={handleChange}
                onApply={handleApplyFilters}
                onReset={handleResetFilters}
            />


            <PatientTable
                title="Appointment List"
                data={filteredAppointments}
                columns={columns}
                totalRows={filteredAppointments.length}
                currentPage={1}
                perPage={10}
                onPageChange={() => { }}
                onPerPageChange={() => { }}
                isLoading={false}

                onEdit={(row) => {
                    navigate(`/appointment/${row.id}`, {
                        state: { editData: row },
                    });
                }}

                onDelete={(row) => handleDelete(row)}
            />

        </div>
    );
};

export default AppointmentList;