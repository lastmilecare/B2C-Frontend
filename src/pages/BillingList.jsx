import React, { useState } from "react";
import { 
  MagnifyingGlassIcon, ArrowPathIcon, PencilSquareIcon, TrashIcon, PrinterIcon 
} from "@heroicons/react/24/outline";
import { useGetMedicineSalesQuery, useDeleteOpdBillMutation } from "../redux/apiSlice";
import { Input, Button } from "../components/UIComponents";

const BillingList = () => {
  const [filters, setFilters] = useState({ billNo: "", patientName: "", startDate: "", endDate: "", status: "Active" });
  const { data: billingList, refetch: refetchList } = useGetMedicineSalesQuery({
    billNumber: filters.billNo, patientName: filters.patientName, startDate: filters.startDate, endDate: filters.endDate
  });
  const [deleteBill] = useDeleteOpdBillMutation();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-sky-700 text-center uppercase tracking-wider">📑 Medicine Billing List</h2>
      
      {/* Search Filters Section */}
      <section className="bg-sky-50 border rounded-lg p-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input label="Bill No" name="billNo" value={filters.billNo} onChange={handleFilterChange} placeholder="Ex: 681" />
          <Input label="Name" name="patientName" value={filters.patientName} onChange={handleFilterChange} placeholder="Ex: Sidhaesh" />
          <Input type="date" label="From" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          <Input type="date" label="To" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          <div className="flex items-end gap-1 mb-1">
            <Button onClick={refetchList}><MagnifyingGlassIcon className="w-4 h-4" /> Search</Button>
            <Button variant="gray" onClick={() => setFilters({ billNo: "", patientName: "", startDate: "", endDate: "", status: "Active" })}><ArrowPathIcon className="w-4 h-4" /></Button>
          </div>
        </div>
      </section>

      {/* Main Ledger Table */}
      <div className="overflow-x-auto border rounded-lg shadow-md max-h-[400px]">
        <table className="w-full text-[10px] text-left">
          <thead className="bg-sky-600 text-white uppercase sticky top-0">
            <tr>
              <th className="p-2 border-r">SL</th>
              <th className="p-2 border-r">Bill No</th>
              <th className="p-2 border-r">UHID</th>
              <th className="p-2 border-r text-center">OPD Bill</th>
              <th className="p-2 border-r">Patient Name</th>
              <th className="p-2 border-r text-center">Qty</th>
              <th className="p-2 border-r text-right">Taxable</th>
              <th className="p-2 border-r text-right">Disc</th>
              <th className="p-2 border-r text-right">Gross Amt</th>
              <th className="p-2 border-r text-right">Paid</th>
              <th className="p-2 border-r text-right text-red-100">Due</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {billingList?.data?.map((bill, index) => (
              <tr key={bill.id} className="hover:bg-sky-50 transition-colors odd:bg-white even:bg-gray-50">
                <td className="p-2 border-r text-center font-bold text-gray-500">{index + 1}</td>
                <td className="p-2 border-r font-bold text-sky-800">{bill.billNumber}</td>
                <td className="p-2 border-r">{bill.uhid || 'N/A'}</td>
                <td className="p-2 border-r text-center">{bill.opdBillNo || 'N/A'}</td>
                <td className="p-2 border-r font-medium">{bill.patientName}</td>
                <td className="p-2 border-r text-center">{bill.totalQuantity || 0}</td>
                <td className="p-2 border-r text-right">₹{bill.taxableAmount || '0.00'}</td>
                <td className="p-2 border-r text-right text-gray-500">₹{bill.totalDiscount || '0.00'}</td>
                <td className="p-2 border-r text-right font-bold text-gray-800">₹{bill.totalAmount}</td>
                <td className="p-2 border-r text-right text-emerald-600 font-bold">₹{bill.paidAmount}</td>
                <td className="p-2 border-r text-right text-red-500 font-bold">₹{bill.dueAmount}</td>
                <td className="p-2 text-center">
                  <div className="flex justify-center gap-2">
                    <button className="text-sky-600"><PencilSquareIcon className="w-4 h-4" /></button>
                    <button onClick={() => deleteBill(bill.id)} className="text-red-500"><TrashIcon className="w-4 h-4" /></button>
                    <button className="text-gray-600"><PrinterIcon className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer Bar */}
      <div className="flex gap-4 text-[10px] font-bold text-sky-700 bg-sky-50 p-2.5 rounded-lg border shadow-sm overflow-x-auto whitespace-nowrap">
        <span>Total Issued Qty: {billingList?.summary?.totalQty || 0}</span>
        <span className="border-l border-sky-200 pl-4 text-emerald-700">Total Paid Amount: ₹ {billingList?.summary?.totalPaid || '0.00'}</span>
        <span className="border-l border-sky-200 pl-4">Total Discount: ₹ {billingList?.summary?.totalDisc || '0.00'}</span>
        <span className="border-l border-sky-200 pl-4">Total Bill Amount: ₹ {billingList?.summary?.totalGross || '0.00'}</span>
        <span className="border-l border-sky-200 pl-4 text-red-600">Total Due Amount: ₹ {billingList?.summary?.totalDue || '0.00'}</span>
      </div>
    </div>
  );
};

export default BillingList;