import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import {
  useCreateAmbulanceMutation,
  useGetAmbulanceQuery,
  useUpdateAmbulanceMutation,
} from '../redux/apiSlice';
import { Input, Select, Button } from '../components/UIComponents';
import { healthAlert } from '../utils/healthSwal';

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

  const { data: ambulance, isLoading } = useGetAmbulanceQuery(id, { skip: !isEdit });
  const [createAmbulance] = useCreateAmbulanceMutation();
  const [updateAmbulance] = useUpdateAmbulanceMutation();
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

  const handleReset = () => {
    setForm(isEdit && ambulance ? {
      company_name: ambulance.company_name || '',
      ambulance_type: ambulance.ambulance_type || 'basic',
      per_month_range: ambulance.per_month_range ?? '',
      fuel_type: ambulance.fuel_type || 'diesel',
      number_plate: ambulance.number_plate || '',
      driver_name: ambulance.driver_name || '',
      driver_number: ambulance.driver_number || '',
      status: ambulance.status || 'available',
    } : initialForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      per_month_range: form.per_month_range ? Number(form.per_month_range) : undefined,
    };

    try {
      if (isEdit) {
        await updateAmbulance({ id, ...payload }).unwrap();
        healthAlert({ title: 'Updated', text: 'Ambulance updated successfully', icon: 'success' });
      } else {
        await createAmbulance(payload).unwrap();
        healthAlert({ title: 'Created', text: 'Ambulance registered successfully', icon: 'success' });
      }
      navigate('/ambulance', { state: { goToList: true } });
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
            <TruckIcon className="w-7 h-7 text-sky-600" />
            {isEdit ? 'Edit Ambulance' : 'Register Ambulance'}
          </h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border overflow-hidden">
          <div className="flex items-center gap-2 px-8 py-5 border-b">
            <ClipboardDocumentIcon className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-semibold text-gray-700">Ambulance Information</h2>
          </div>

          {isEdit && ambulance?.unique_name && (
            <div className="mx-8 mt-6 p-3 bg-sky-50 border border-sky-100 rounded-lg text-sm text-sky-800">
              System ID: <strong>{ambulance.unique_name}</strong>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-5">Vehicle Details</h3>
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
            </div>

            <div>
              <h3 className="text-md font-semibold text-gray-700 mb-5">Driver Details</h3>
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
                  onClick={() => navigate('/ambulance', { state: { goToList: true } })}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="sky">
                  <CheckCircleIcon className="w-5 h-5 inline mr-1" />
                  {isEdit ? 'Update Ambulance' : 'Register Ambulance'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceForm;
