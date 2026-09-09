import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreateAmbulanceMutation,
  useGetAmbulanceQuery,
  useUpdateAmbulanceMutation,
} from '../redux/apiSlice';
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
      navigate('/ambulance');
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
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        {isEdit ? 'Edit Ambulance' : 'Register Ambulance'}
      </h1>

      {isEdit && ambulance?.unique_name && (
        <div className="mb-4 p-3 bg-sky-50 border border-sky-100 rounded-lg text-sm">
          System ID: <strong>{ambulance.unique_name}</strong>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-500">Ambulance Company Name *</label>
          <input
            name="company_name"
            value={form.company_name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500">Ambulance Type *</label>
          <select
            name="ambulance_type"
            value={form.ambulance_type}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="basic">Basic</option>
            <option value="advanced">Advanced</option>
            <option value="icu">ICU</option>
            <option value="neonatal">Neonatal</option>
            <option value="patient_transport">Patient Transport</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500">Per Month Range (km)</label>
          <input
            type="number"
            name="per_month_range"
            value={form.per_month_range}
            onChange={handleChange}
            min="0"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500">Fuel Type *</label>
          <select
            name="fuel_type"
            value={form.fuel_type}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          >
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="cng">CNG</option>
            <option value="electric">Electric</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500">Number Plate *</label>
          <input
            name="number_plate"
            value={form.number_plate}
            onChange={handleChange}
            required
            disabled={isEdit}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 disabled:bg-slate-50"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500">Driver Name *</label>
          <input
            name="driver_name"
            value={form.driver_name}
            onChange={handleChange}
            required
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-500">Driver Mobile *</label>
          <input
            name="driver_number"
            value={form.driver_number}
            onChange={handleChange}
            required
            maxLength={10}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </div>

        {isEdit && (
          <div>
            <label className="text-xs font-medium text-slate-500">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            >
              <option value="available">Available</option>
              <option value="on_trip">On Trip</option>
              <option value="maintenance">Maintenance</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        <div className="md:col-span-2 flex gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-sky-600 text-white rounded-lg font-medium hover:bg-sky-700"
          >
            {isEdit ? 'Update' : 'Register Ambulance'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/ambulance')}
            className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AmbulanceForm;
