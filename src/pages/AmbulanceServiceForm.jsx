import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreateAmbulanceServiceMutation,
  useGetAmbulanceServiceQuery,
  useGetAmbulancesQuery,
  useUpdateAmbulanceServiceMutation,
} from '../redux/apiSlice';
import { healthAlert } from '../utils/healthSwal';

const initialForm = {
  ambulance_id: '',
  start_point: '',
  end_point: '',
  pickup_address: '',
  drop_address: '',
  patient_name: '',
  patient_mobile: '',
  major_symptom: '',
  patient_type: 'outsider',
  status: 'pending',
};

const AmbulanceServiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');

  const { data: service, isLoading } = useGetAmbulanceServiceQuery(id, { skip: !isEdit });
  const { data: ambulanceData } = useGetAmbulancesQuery({ page: 1, limit: 100 });
  const [createService] = useCreateAmbulanceServiceMutation();
  const [updateService] = useUpdateAmbulanceServiceMutation();
  const [form, setForm] = useState(initialForm);

  const ambulances = ambulanceData?.data || [];

  useEffect(() => {
    if (service) {
      setForm({
        ambulance_id: service.ambulance_id || '',
        start_point: service.start_point || '',
        end_point: service.end_point || '',
        pickup_address: service.pickup_address || '',
        drop_address: service.drop_address || '',
        patient_name: service.patient_name || '',
        patient_mobile: service.patient_mobile || '',
        major_symptom: service.major_symptom || '',
        patient_type: service.patient_type || 'outsider',
        status: service.status || 'pending',
      });
    }
  }, [service]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'patient_mobile') {
      finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    setForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      patient_mobile: form.patient_mobile || undefined,
      major_symptom: form.major_symptom || undefined,
    };

    try {
      if (isEdit) {
        await updateService({ id, ...payload }).unwrap();
        healthAlert({ title: 'Updated', text: 'Service updated successfully', icon: 'success' });
      } else {
        await createService(payload).unwrap();
        healthAlert({ title: 'Created', text: 'Ambulance service booked', icon: 'success' });
      }
      navigate('/ambulance-service');
    } catch (err) {
      healthAlert({
        title: 'Error',
        text: err?.data?.message?.[0] || err?.data?.message || 'Save failed',
        icon: 'error',
      });
    }
  };

  if (isEdit && isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        {isEdit ? 'Edit Ambulance Service' : 'Book Ambulance Service'}
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Select Ambulance *</label>
          <select
            name="ambulance_id"
            value={form.ambulance_id}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Choose ambulance</option>
            {ambulances.map((amb) => (
              <option key={amb.id} value={amb.id}>
                {amb.unique_name} — {amb.company_name} ({amb.number_plate}) [{amb.status}]
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Start Point *</label>
            <input
              name="start_point"
              value={form.start_point}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">End Point *</label>
            <input
              name="end_point"
              value={form.end_point}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Pickup Location Address *</label>
          <textarea
            name="pickup_address"
            value={form.pickup_address}
            onChange={handleChange}
            required
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Drop Location Address *</label>
          <textarea
            name="drop_address"
            value={form.drop_address}
            onChange={handleChange}
            required
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Patient Name *</label>
            <input
              name="patient_name"
              value={form.patient_name}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Patient Mobile</label>
            <input
              name="patient_mobile"
              value={form.patient_mobile}
              onChange={handleChange}
              maxLength={10}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Major Symptom (if available)</label>
          <textarea
            name="major_symptom"
            value={form.major_symptom}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Patient Type *</label>
            <select
              name="patient_type"
              value={form.patient_type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="outsider">Outsider Patient</option>
              <option value="company">Company Patient</option>
            </select>
          </div>

          {isEdit && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-700">Service Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {isEdit ? 'Update Service' : 'Book Service'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/ambulance-services')}
            className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AmbulanceServiceForm;
