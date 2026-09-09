import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CopyFilterBar from '../components/Updates/Filter';
import PatientTable from '../components/Updates/PatientTable';
import Avatar from '../components/common/Avatar';
import {
  useDeleteAmbulanceServiceMutation,
  useGetAmbulanceServicesQuery,
} from '../redux/apiSlice';
import { healthAlert } from '../utils/healthSwal';
import { formatDate, formatTime } from '../utils/helper';

const AmbulanceServiceList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [tempFilters, setTempFilters] = useState({
    patient_name: '',
    patient_mobile: '',
    patient_type: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [filters, setFilters] = useState({});

  const { data, isLoading } = useGetAmbulanceServicesQuery({ page, limit, ...filters });
  const [deleteService] = useDeleteAmbulanceServiceMutation();

  const services = data?.data || [];
  const pagination = data?.pagination || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'patient_mobile') {
      finalValue = value.replace(/[^0-9]/g, '').slice(0, 10);
    }

    setTempFilters((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleApplyFilters = () => {
    const today = new Date().toISOString().split('T')[0];
    const { startDate, endDate } = tempFilters;

    if (endDate && endDate > today) {
      healthAlert({
        title: 'Invalid Date',
        text: 'End date cannot be greater than today',
        icon: 'info',
      });
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      healthAlert({
        title: 'Date Range Error',
        text: 'Start date cannot be after end date',
        icon: 'info',
      });
      return;
    }

    setFilters(tempFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters({
      patient_name: '',
      patient_mobile: '',
      patient_type: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setFilters({});
    setPage(1);
  };

  const handleDelete = async (row) => {
    if (!window.confirm(`Delete service for ${row.patient_name}?`)) return;

    try {
      await deleteService(row.id).unwrap();
      healthAlert({
        title: 'Success',
        text: 'Service record deleted',
        icon: 'success',
      });
    } catch (err) {
      healthAlert({
        title: 'Error',
        text: err?.data?.message || 'Delete failed',
        icon: 'error',
      });
    }
  };

  const filtersConfig = [
    { label: 'Patient Name', name: 'patient_name', type: 'text' },
    { label: 'Patient Mobile', name: 'patient_mobile', type: 'text' },
    {
      label: 'Patient Type',
      name: 'patient_type',
      type: 'select',
      options: [
        { label: 'Outsider', value: 'outsider' },
        { label: 'Company', value: 'company' },
      ],
    },
    {
      label: 'Status',
      name: 'status',
      type: 'select',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in_progress' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
    },
    { label: 'Date from', name: 'startDate', type: 'date' },
    { label: 'Date to', name: 'endDate', type: 'date' },
  ];

  const columns = [
    {
      name: 'Patient',
      width: '220px',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.patient_name} />
          <div className="leading-tight">
            <p className="font-semibold text-gray-800">{row.patient_name}</p>
            <p className="text-xs text-gray-500">{row.patient_mobile || 'No mobile'}</p>
          </div>
        </div>
      ),
    },
    {
      name: 'Ambulance',
      cell: (row) => (
        <div className="text-xs">
          <p className="font-medium">{row.ambulance?.unique_name || 'N/A'}</p>
          <p className="text-slate-500">{row.ambulance?.number_plate}</p>
        </div>
      ),
    },
    {
      name: 'Route',
      width: '220px',
      cell: (row) => (
        <div className="text-xs">
          <p><span className="text-slate-500">From:</span> {row.start_point}</p>
          <p><span className="text-slate-500">To:</span> {row.end_point}</p>
        </div>
      ),
    },
    {
      name: 'Pickup / Drop',
      width: '240px',
      cell: (row) => (
        <div className="text-xs">
          <p className="truncate max-w-[220px]" title={row.pickup_address}>
            📍 {row.pickup_address}
          </p>
          <p className="truncate max-w-[220px]" title={row.drop_address}>
            🏥 {row.drop_address}
          </p>
        </div>
      ),
    },
    {
      name: 'Symptom',
      cell: (row) => (
        <span className="text-xs text-slate-600">{row.major_symptom || 'N/A'}</span>
      ),
    },
    {
      name: 'Type',
      cell: (row) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
            row.patient_type === 'company'
              ? 'bg-green-100 text-green-700'
              : 'bg-purple-100 text-purple-700'
          }`}
        >
          {row.patient_type}
        </span>
      ),
    },
    {
      name: 'Status',
      cell: (row) => {
        const colors = {
          pending: 'bg-amber-100 text-amber-700',
          in_progress: 'bg-blue-100 text-blue-700',
          completed: 'bg-green-100 text-green-700',
          cancelled: 'bg-red-100 text-red-700',
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${colors[row.status]}`}
          >
            {row.status?.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      name: 'Date & Time',
      cell: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-slate-700">{formatDate(row.createdAt)}</span>
          <span className="text-slate-400">{formatTime(row.createdAt)}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">Ambulance Services</h1>

      <CopyFilterBar
        filtersConfig={filtersConfig}
        tempFilters={tempFilters}
        onChange={handleChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <PatientTable
        title="Service Requests"
        data={services}
        columns={columns}
        totalRows={pagination.totalRecords || 0}
        currentPage={pagination.currentPage || page}
        perPage={limit}
        onPageChange={(p) => setPage(p)}
        onPerPageChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        isLoading={isLoading}
        onEdit={(row) => navigate(`/ambulance-services/${row.id}`)}
        onDelete={handleDelete}
        enableAdd
        addButtonText="New Service"
        onAdd={() => navigate('/ambulance-services')}
      />
    </div>
  );
};

export default AmbulanceServiceList;
