import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import {
  useCreateAmbulanceServiceMutation,
  useGetAmbulanceServiceQuery,
  useGetAmbulancesQuery,
  useUpdateAmbulanceServiceMutation,
} from '../redux/apiSlice';
import { Input, Select, Button } from '../components/UIComponents';
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

  const handleReset = () => {
    setForm(isEdit && service ? {
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
    } : initialForm);
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
      navigate('/ambulance-service', { state: { goToList: true } });
    } catch (err) {
      healthAlert({
        title: 'Error',
        text: err?.data?.message?.[0] || err?.data?.message || 'Save failed',
        icon: 'error',
      });
    }
  };

  if (isEdit && isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-800">
            <HeartIcon className="w-7 h-7 text-sky-600" />
            {isEdit ? 'Edit Ambulance Service' : 'Book Ambulance Service'}
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
          <div className="flex items-center gap-2 px-8 py-5 border-b">
            <ClipboardDocumentIcon className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-semibold text-gray-700">Service Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-5">Trip Details</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <Select
                    label="Select Ambulance"
                    name="ambulance_id"
                    value={form.ambulance_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose ambulance</option>
                    {ambulances.map((amb) => (
                      <option key={amb.id} value={amb.id}>
                        {amb.unique_name} — {amb.company_name} ({amb.number_plate}) [{amb.status}]
                      </option>
                    ))}
                  </Select>
                </div>

                <Input
                  label="Start Point"
                  name="start_point"
                  value={form.start_point}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="End Point"
                  name="end_point"
                  value={form.end_point}
                  onChange={handleChange}
                  required
                />

                <div className="md:col-span-3">
                  <label className="text-sm text-gray-600 block mb-1 font-medium">
                    Pickup Location Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="pickup_address"
                    value={form.pickup_address}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="text-sm text-gray-600 block mb-1 font-medium">
                    Drop Location Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="drop_address"
                    value={form.drop_address}
                    onChange={handleChange}
                    required
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-5">Patient Details</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <Input
                  label="Patient Name"
                  name="patient_name"
                  value={form.patient_name}
                  onChange={handleChange}
                  required
                />

                <Input
                  label="Patient Mobile"
                  name="patient_mobile"
                  value={form.patient_mobile}
                  onChange={handleChange}
                  maxLength={10}
                />

                <Select
                  label="Patient Type"
                  name="patient_type"
                  value={form.patient_type}
                  onChange={handleChange}
                  required
                >
                  <option value="outsider">Outsider Patient</option>
                  <option value="company">Company Patient</option>
                </Select>

                <div className="md:col-span-3">
                  <label className="text-sm text-gray-600 block mb-1 font-medium">
                    Major Symptom (if available)
                  </label>
                  <textarea
                    name="major_symptom"
                    value={form.major_symptom}
                    onChange={handleChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400"
                  />
                </div>

                {isEdit && (
                  <Select
                    label="Service Status"
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </Select>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t">
              <Button type="button" variant="gray" onClick={handleReset}>
                <ArrowPathIcon className="w-5 h-5 inline mr-1" />
                Reset
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="gray"
                  onClick={() => navigate('/ambulance-service', { state: { goToList: true } })}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="sky">
                  <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                  {isEdit ? 'Update Service' : 'Book Service'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceServiceForm;
