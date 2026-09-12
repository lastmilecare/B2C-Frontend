import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  DocumentCheckIcon,
  TruckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import {
  useCreateAmbulanceMutation,
  useGetAmbulanceQuery,
  useUpdateAmbulanceMutation,
} from '../redux/apiSlice';
import { Input, Select, Button } from '../components/UIComponents';
import { healthAlerts } from '../utils/healthSwal';
import { getApiErrorMessage } from '../utils/helper';

const STEPS = [
  { id: 1, label: 'Vehicle Details', icon: TruckIcon },
  { id: 2, label: 'Driver Details', icon: UserIcon },
  { id: 3, label: 'Confirm', icon: DocumentCheckIcon },
];

const initialForm = {
  company_name: '',
  ambulance_type: 'basic',
  per_month_range: '',
  fuel_type: 'diesel',
  number_plate: '',
  driver_name: '',
  driver_number: '',
  status: 'available',
};

const AmbulanceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id && id !== 'new');
  const [activeStep, setActiveStep] = useState(1);

  const { data: ambulance, isLoading } = useGetAmbulanceQuery(id, { skip: !isEdit });
  const [createAmbulance, { isLoading: isCreating }] = useCreateAmbulanceMutation();
  const [updateAmbulance, { isLoading: isUpdating }] = useUpdateAmbulanceMutation();
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (ambulance) {
      setForm({
        company_name: ambulance.company_name || '',
        ambulance_type: ambulance.ambulance_type || 'basic',
        per_month_range: ambulance.per_month_range ?? '',
        fuel_type: ambulance.fuel_type || 'diesel',
        number_plate: ambulance.number_plate || '',
        driver_name: ambulance.driver_name || '',
        driver_number: ambulance.driver_number || '',
        status: ambulance.status || 'available',
      });
    }
  }, [ambulance]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'driver_number') {
      finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    if (name === 'number_plate') {
      finalValue = value.toUpperCase();
    }

    setForm((prev) => ({ ...prev, [name]: finalValue }));
  };

  const getStepOneValues = () => ({
    company_name: form.company_name.trim(),
    ambulance_type: form.ambulance_type,
    per_month_range: form.per_month_range,
    fuel_type: form.fuel_type,
    number_plate: form.number_plate.trim(),
  });

  const getStepTwoValues = () => ({
    driver_name: form.driver_name.trim(),
    driver_number: form.driver_number.trim(),
    status: form.status,
  });

  const validateStep = (step) => {
    if (step === 1) {
      const values = getStepOneValues();
      if (!values.company_name) return 'Ambulance company name is required';
      if (!values.number_plate) return 'Number plate is required';
      return null;
    }

    if (step === 2) {
      const values = getStepTwoValues();
      if (!values.driver_name) return 'Driver name is required';
      if (!values.driver_number || values.driver_number.length !== 10) {
        return 'Driver mobile must be 10 digits';
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
        company_name: '',
        ambulance_type: 'basic',
        per_month_range: '',
        fuel_type: 'diesel',
        number_plate: isEdit ? prev.number_plate : '',
      }));
      return;
    }

    if (activeStep === 2) {
      setForm((prev) => ({
        ...prev,
        driver_name: '',
        driver_number: '',
        status: 'available',
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
      per_month_range: form.per_month_range ? Number(form.per_month_range) : undefined,
    };

    try {
      if (isEdit) {
        await updateAmbulance({ id, ...payload }).unwrap();
        healthAlerts.success('Ambulance updated successfully', 'Updated');
      } else {
        await createAmbulance(payload).unwrap();
        healthAlerts.success('Ambulance registered successfully', 'Created');
      }
      navigate('/ambulance', { state: { goToList: true } });
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
              <TruckIcon className="w-6 h-6 text-blue-600" />
            </span>
            {isEdit ? 'Edit Ambulance' : 'Register Ambulance'}
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

          {isEdit && ambulance?.unique_name && activeStep === 1 && (
            <div className="mx-9 mt-6 p-3 bg-sky-50 border border-sky-100 rounded-lg text-sm text-sky-800">
              System ID: <strong>{ambulance.unique_name}</strong>
            </div>
          )}

          <form onSubmit={(e) => e.preventDefault()} className="p-9 space-y-8">
            {activeStep === 1 && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-3">
                  <Input
                    label="Ambulance Company Name"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Select
                  label="Ambulance Type"
                  name="ambulance_type"
                  value={form.ambulance_type}
                  onChange={handleChange}
                  required
                >
                  <option value="basic">Basic</option>
                  <option value="advanced">Advanced</option>
                  <option value="icu">ICU</option>
                  <option value="neonatal">Neonatal</option>
                  <option value="patient_transport">Patient Transport</option>
                </Select>

                <Input
                  label="Per Month Range (km)"
                  name="per_month_range"
                  type="number"
                  min="0"
                  value={form.per_month_range}
                  onChange={handleChange}
                />

                <Select
                  label="Fuel Type"
                  name="fuel_type"
                  value={form.fuel_type}
                  onChange={handleChange}
                  required
                >
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="cng">CNG</option>
                  <option value="electric">Electric</option>
                </Select>

                <Input
                  label="Number Plate"
                  name="number_plate"
                  value={form.number_plate}
                  onChange={handleChange}
                  required
                  disabled={isEdit}
                />
              </div>
            )}

            {activeStep === 2 && (
              <section className="bg-sky-50/40 p-6 rounded-xl border border-sky-100">
                <h3 className="text-sky-700 font-semibold text-lg mb-5">Driver Information</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <Input
                    label="Driver Name"
                    name="driver_name"
                    value={form.driver_name}
                    onChange={handleChange}
                    required
                  />

                  <Input
                    label="Driver Mobile"
                    name="driver_number"
                    value={form.driver_number}
                    onChange={handleChange}
                    required
                    maxLength={10}
                  />

                  {isEdit && (
                    <Select
                      label="Status"
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="available">Available</option>
                      <option value="on_trip">On Trip</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </Select>
                  )}
                </div>
              </section>
            )}

            {activeStep === 3 && (
              <div className="bg-sky-50 p-6 rounded-xl border space-y-3">
                <h3 className="font-semibold text-sky-700 flex items-center gap-2">
                  <ClipboardDocumentIcon className="w-5 h-5" />
                  Confirm Ambulance Details
                </h3>
                <p><b>Company:</b> {form.company_name || '-'}</p>
                <p><b>Ambulance Type:</b> {formatLabel(form.ambulance_type)}</p>
                <p><b>Per Month Range:</b> {form.per_month_range ? `${form.per_month_range} km` : '-'}</p>
                <p><b>Fuel Type:</b> {formatLabel(form.fuel_type)}</p>
                <p><b>Number Plate:</b> {form.number_plate || '-'}</p>
                <p><b>Driver Name:</b> {form.driver_name || '-'}</p>
                <p><b>Driver Mobile:</b> {form.driver_number || '-'}</p>
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
                  onClick={() => navigate('/ambulance', { state: { goToList: true } })}
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
                    {isEdit ? 'Update Ambulance' : 'Register Ambulance'}
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

export default AmbulanceForm;
