import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CopyFilterBar from '../components/Updates/Filter';
import PatientTable from '../components/Updates/PatientTable';
import Avatar from '../components/common/Avatar';
import {
  useDeleteAmbulanceServiceMutation,
  useGetAmbulanceServicesQuery,
  useUpdateAmbulanceMutation,
} from '../redux/apiSlice';
import { healthAlert } from '../utils/healthSwal';
import { formatDate, formatTime, getApiErrorMessage } from '../utils/helper';

const AMBULANCE_STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'on_trip', label: 'On Trip' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inactive', label: 'Inactive' },
];

const STATUS_COLORS = {
  available: 'bg-green-100 text-green-700',
  on_trip: 'bg-amber-100 text-amber-700',
  maintenance: 'bg-orange-100 text-orange-700',
  inactive: 'bg-gray-100 text-gray-600',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
      STATUS_COLORS[status] || STATUS_COLORS.inactive
    }`}
  >
    {status.replace('_', ' ')}
  </span>
);

const TypeBadge = ({ type }) => (
  <span
    className={`inline-flex items-center whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-semibold capitalize ${
      type === 'company'
        ? 'bg-green-100 text-green-700'
        : 'bg-purple-100 text-purple-700'
    }`}
  >
    {type}
  </span>
);

const AmbulanceServiceList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [tempFilters, setTempFilters] = useState({
    patient_name: '',
    patient_type: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [filters, setFilters] = useState({});

  const { data, isLoading } = useGetAmbulanceServicesQuery({ page, limit, ...filters });
  const [deleteService] = useDeleteAmbulanceServiceMutation();
  const [updateAmbulance] = useUpdateAmbulanceMutation();

  const services = data?.data || [];
  const pagination = data?.pagination || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempFilters((prev) => ({ ...prev, [name]: value }));
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

    const cleanedFilters = Object.fromEntries(
      Object.entries(tempFilters).filter(([, value]) => value !== ''),
    );
    setFilters(cleanedFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setTempFilters({
      patient_name: '',
      patient_type: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    setFilters({});
    setPage(1);
  };

  const handleStatusChange = async (row, status) => {
    const ambulanceId = row.ambulance_id || row.ambulance?.id;
    if (!ambulanceId) {
      healthAlert({
        title: 'Error',
        text: 'No ambulance linked to this service',
        icon: 'error',
      });
      return;
    }

    try {
      await updateAmbulance({ id: ambulanceId, status }).unwrap();
      healthAlert({
        title: 'Success',
        text: 'Ambulance status updated',
        icon: 'success',
      });
    } catch (err) {
      healthAlert({
        title: 'Error',
        text: getApiErrorMessage(err, 'Status update failed'),
        icon: 'error',
      });
    }
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
      minWidth: '190px',
      wrap: false,
      cell: (row) => (
        <div className="flex items-center gap-2.5 py-1">
          <Avatar name={row.patient_name} />
          <div className="min-w-0 leading-tight">
            <p className="font-semibold text-gray-800 truncate">{row.patient_name}</p>
            <p className="text-xs text-gray-500 whitespace-nowrap">
              {row.patient_mobile || 'No mobile'}
            </p>
          </div>
        </div>
      ),
    },
    {
      name: 'Ambulance',
      minWidth: '150px',
      wrap: false,
      cell: (row) => (
        <div className="py-1 text-xs min-w-0">
          <p
            className="font-medium truncate max-w-[140px]"
            title={row.ambulance?.unique_name}
          >
            {row.ambulance?.unique_name || 'N/A'}
          </p>
          <p
            className="text-slate-500 truncate max-w-[140px]"
            title={row.ambulance?.number_plate}
          >
            {row.ambulance?.number_plate || '—'}
          </p>
        </div>
      ),
    },
    {
      name: 'Route',
      minWidth: '170px',
      wrap: false,
      cell: (row) => (
        <div className="py-1 text-xs leading-snug">
          <p className="truncate max-w-[160px]" title={row.start_point}>
            <span className="text-slate-500">From:</span> {row.start_point}
          </p>
          <p className="truncate max-w-[160px]" title={row.end_point}>
            <span className="text-slate-500">To:</span> {row.end_point}
          </p>
        </div>
      ),
    },
    {
      name: 'Pickup / Drop',
      minWidth: '210px',
      wrap: false,
      cell: (row) => (
        <div className="py-1 text-xs space-y-0.5">
          <p className="flex items-center gap-1 min-w-0" title={row.pickup_address}>
            <span className="shrink-0">📍</span>
            <span className="truncate">{row.pickup_address}</span>
          </p>
          <p className="flex items-center gap-1 min-w-0" title={row.drop_address}>
            <span className="shrink-0">🏥</span>
            <span className="truncate">{row.drop_address}</span>
          </p>
        </div>
      ),
    },
    {
      name: 'Symptom',
      minWidth: '100px',
      wrap: false,
      cell: (row) => (
        <span
          className="block text-xs text-slate-600 truncate max-w-[100px]"
          title={row.major_symptom || 'N/A'}
        >
          {row.major_symptom || 'N/A'}
        </span>
      ),
    },
    {
      name: 'Type',
      minWidth: '100px',
      wrap: false,
      center: true,
      cell: (row) => <TypeBadge type={row.patient_type} />,
    },
    {
      name: 'Status',
      minWidth: '115px',
      wrap: false,
      center: true,
      cell: (row) => (
        <StatusBadge status={row.ambulance?.status || 'available'} />
      ),
    },
    {
      name: 'Date & Time',
      minWidth: '125px',
      wrap: false,
      cell: (row) => (
        <div className="py-1 text-xs leading-tight whitespace-nowrap">
          <p className="font-medium text-slate-700">{formatDate(row.createdAt)}</p>
          <p className="text-slate-400">{formatTime(row.createdAt)}</p>
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

      <div className="overflow-x-auto">
      <PatientTable
        title="Service Requests"
        responsive={false}
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
        actionButtons={['edit', 'status', 'delete']}
        statusOptions={AMBULANCE_STATUS_OPTIONS}
        getRowStatus={(row) => row.ambulance?.status}
        onStatus={handleStatusChange}
        onEdit={(row) =>
          navigate(`/ambulance-service/${row.id}`, {
            state: { goToForm: true },
          })
        }
        onDelete={handleDelete}
        enableAdd
        addButtonText="New Service"
        onAdd={() =>
          navigate('/ambulance-service', {
            state: { goToForm: true },
          })
        }
      />
      </div>
    </div>
  );
};

export default AmbulanceServiceList;
