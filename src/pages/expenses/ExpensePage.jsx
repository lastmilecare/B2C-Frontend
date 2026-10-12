import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { ClipboardDocumentIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import TotalExpReport from './TotalExpReport';
import { getSheetDefinition } from './expenseSheetDefinitions';

const ExpensePage = ({ reportType, moduleTitle }) => {
  const location = useLocation();
  const { id } = useParams();
  const definition = getSheetDefinition(reportType);
  const tabLabel = moduleTitle || definition?.module_title || 'Expense';

  const isTotalExp = reportType === 'total_exp_summary';
  const isFormRoute =
    id === 'edit' || id === 'new' || location.state?.goToForm;

  const [activeTab, setActiveTab] = useState(
    isTotalExp ? 'report' : isFormRoute ? 'form' : 'list',
  );

  useEffect(() => {
    if (isTotalExp) {
      setActiveTab('report');
      return;
    }
    if (location.state?.goToList) setActiveTab('list');
    else if (location.state?.goToForm || id === 'edit' || id === 'new') setActiveTab('form');
  }, [id, location.state, isTotalExp]);

  if (isTotalExp) {
    return (
      <div className="mx-auto mt-4 max-w-[100%]">
        <TotalExpReport />
      </div>
    );
  }

  return (
    <div className="mx-auto mt-4 max-w-[100%]">
      <div className="-mt-4 mb-6 flex justify-center">
        <div className="flex overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`flex items-center gap-2 px-8 py-2.5 text-sm font-semibold ${
              activeTab === 'form' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ClipboardDocumentIcon className="h-4 w-4" />
            {tabLabel}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-8 py-2.5 text-sm font-semibold ${
              activeTab === 'list' ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <ListBulletIcon className="h-4 w-4" />
            List
          </button>
        </div>
      </div>

      {activeTab === 'form' ? (
        <ExpenseForm reportType={reportType} />
      ) : (
        <ExpenseList reportType={reportType} listTitle={moduleTitle} />
      )}
    </div>
  );
};

export default ExpensePage;
