import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  DocumentCheckIcon,
  HeartIcon,
  MapPinIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  useCreateAmbulanceServiceMutation,
  useGetAmbulanceServiceQuery,
  useGetAmbulancesQuery,
  useUpdateAmbulanceServiceMutation,
} from '../redux/apiSlice';
import { Input, Select, Button } from '../components/UIComponents';
import { healthAlerts } from '../utils/healthSwal';
import { getApiErrorMessage } from '../utils/helper';

const STEPS = [
  { id: 1, label: 'Trip Details', icon: MapPinIcon },
  { id: 2, label: 'Patient Details', icon: UserIcon },
  { id: 3, label: 'Confirm', icon: DocumentCheckIcon },
];

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
  const [activeStep, setActiveStep] = useState(1);

  const { data: service, isLoading } = useGetAmbulanceServiceQuery(id, { skip: !isEdit });
  const { data: ambulanceData } = useGetAmbulancesQuery({ page: 1, limit: 100 });
  const [createService, { isLoading: isCreating }] = useCreateAmbulanceServiceMutation();
  const [updateService, { isLoading: isUpdating }] = useUpdateAmbulanceServiceMutation();
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

  const selectedAmbulance = ambulances.find(
    (amb) => String(amb.id) === String(form.ambulance_id),
  );

  const validateStep = (step) => {
    if (step === 1) {
      if (!form.ambulance_id) return 'Please select an ambulance';
      if (!form.start_point.trim()) return 'Start point is required';
      if (!form.end_point.trim()) return 'End point is required';
      if (!form.pickup_address.trim()) return 'Pickup address is required';
      if (!form.drop_address.trim()) return 'Drop address is required';
      return null;
    }

    if (step === 2) {
      if (!form.patient_name.trim()) return 'Patient name is required';
      if (form.patient_mobile && form.patient_mobile.length !== 10) {
        return 'Patient mobile must be 10 digits';
      }
      return null;
    }

    return null;
  };

  const nextStep = () => {
    const error = validateStep(activeStep);
    if (error) {
      healthAlerts.warning(error);
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const prevStep = () => setActiveStep((prev) => prev - 1);

  const handleReset = () => {
    if (activeStep === 1) {
      setForm((prev) => ({
        ...prev,
        ambulance_id: '',
        start_point: '',
        end_point: '',
        pickup_address: '',
        drop_address: '',
      }));
      return;
    }

    if (activeStep === 2) {
      setForm((prev) => ({
        ...prev,
        patient_name: '',
        patient_mobile: '',
        major_symptom: '',
        patient_type: 'outsider',
        status: 'pending',
      }));
    }
  };

  const handleSubmit = async () => {
    const stepOneError = validateStep(1);
    const stepTwoError = validateStep(2);
    if (stepOneError || stepTwoError) {
      healthAlerts.warning(stepOneError || stepTwoError);
      return;
    }

    const payload = {
      ...form,
      patient_mobile: form.patient_mobile || undefined,
      major_symptom: form.major_symptom || undefined,
    };

    try {
      if (isEdit) {
        await updateService({ id, ...payload }).unwrap();
        healthAlerts.success('Service updated successfully', 'Updated');
      } else {
        await createService(payload).unwrap();
        healthAlerts.success('Ambulance service booked', 'Created');
      }
      navigate('/ambulance-service', { state: { goToList: true } });
    } catch (err) {
      healthAlerts.error(getApiErrorMessage(err, 'Save failed'), 'Error');
    }
  };

  const formatLabel = (value) =>
    value ? String(value).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '-';

  if (isEdit && isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 py-10">
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <span className="bg-blue-100 p-2 rounded-xl">
              <HeartIcon className="w-6 h-6 text-blue-600" />
            </span>
            {isEdit ? 'Edit Ambulance Service' : 'Book Ambulance Service'}
          </h1>

          <div className="flex gap-2">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className={`h-2 w-12 rounded-full ${
                  activeStep >= step.id ? 'bg-sky-600' : 'bg-blue-100'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
          <div className="flex border-b">
            {STEPS.map((step) => (
              <button
                key={step.id}
                type="button"
                disabled
                className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-semibold ${
                  activeStep === step.id
                    ? 'text-sky-600 border-b-2 border-sky-600'
                    : 'text-gray-400'
                }`}
              >
                <step.icon className="w-4 h-4" />
                {step.label}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="p-9 space-y-8">
            {activeStep === 1 && (
              <section className="bg-sky-50/40 p-6 rounded-xl border border-sky-100 space-y-6">
                <h3 className="text-sky-700 font-semibold text-lg">Trip Information</h3>
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
              </section>
            )}

            {activeStep === 2 && (
              <section className="bg-sky-50/40 p-6 rounded-xl border border-sky-100 space-y-6">
                <h3 className="text-sky-700 font-semibold text-lg">Patient Information</h3>
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
              </section>
            )}

            {activeStep === 3 && (
              <div className="bg-sky-50 p-6 rounded-xl border space-y-3">
                <h3 className="font-semibold text-sky-700 flex items-center gap-2">
                  <ClipboardDocumentIcon className="w-5 h-5" />
                  Confirm Service Details
                </h3>
                <p>
                  <b>Ambulance:</b>{' '}
                  {selectedAmbulance
                    ? `${selectedAmbulance.unique_name} — ${selectedAmbulance.company_name}`
                    : '-'}
                </p>
                <p><b>Start Point:</b> {form.start_point || '-'}</p>
                <p><b>End Point:</b> {form.end_point || '-'}</p>
                <p><b>Pickup Address:</b> {form.pickup_address || '-'}</p>
                <p><b>Drop Address:</b> {form.drop_address || '-'}</p>
                <p><b>Patient Name:</b> {form.patient_name || '-'}</p>
                <p><b>Patient Mobile:</b> {form.patient_mobile || '-'}</p>
                <p><b>Patient Type:</b> {formatLabel(form.patient_type)}</p>
                <p><b>Major Symptom:</b> {form.major_symptom || '-'}</p>
                {isEdit && <p><b>Status:</b> {formatLabel(form.status)}</p>}
              </div>
            )}

            <div className="flex justify-between items-center pt-6 border-t flex-wrap gap-3">
              <div className="flex gap-3">
                {activeStep > 1 && (
                  <Button type="button" variant="gray" onClick={prevStep}>
                    Back
                  </Button>
                )}

                {activeStep < 3 && (
                  <Button type="button" variant="gray" onClick={handleReset}>
                    <ArrowPathIcon className="w-5 h-5 inline mr-1" />
                    Reset
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="gray"
                  onClick={() => navigate('/ambulance-service', { state: { goToList: true } })}
                >
                  Cancel
                </Button>

                {activeStep < STEPS.length ? (
                  <Button type="button" variant="sky" onClick={nextStep}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="sky"
                    onClick={handleSubmit}
                    disabled={isCreating || isUpdating}
                  >
                    <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                    {isEdit ? 'Update Service' : 'Book Service'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceServiceForm;
