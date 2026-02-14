import React, { useState } from "react";
import { Input, Select, Button } from "../components/UIComponents";

const ITEM_TYPES = ["DROP", "SYRUP", "SUSPENSION", "TABLET", "CAPSULE", "CREAM", "OINTMENT", "OTHERS"];

const StockDetails = () => {
  const [filters, setFilters] = useState({ invoiceNo: "", supplier: "", itemType: "", itemName: "", dateFrom: "", dateTo: "" });
  const [summary, setSummary] = useState({ 
    totalCp: "", totalMrp: "", recvQty: "", freeQty: "", salesAmount: "", 
    balanceQty: "", salesQty: "", remainingCp: "", condQty: "" 
  });

  const handleSearch = () => {
    setSummary({
      totalCp: "12,450.00", totalMrp: "18,200.00", recvQty: "1,250", freeQty: "120",
      salesAmount: "5,670.00", balanceQty: "1,130", salesQty: "120", remainingCp: "6,780.00", condQty: "0"
    });
  };

  const handleReset = () => {
    setFilters({ invoiceNo: "", supplier: "", itemType: "", itemName: "", dateFrom: "", dateTo: "" });
    setSummary({ totalCp: "", totalMrp: "", recvQty: "", freeQty: "", salesAmount: "", balanceQty: "", salesQty: "", remainingCp: "", condQty: "" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-sky-700 text-center mb-6">📊 Stock Details</h2>
      
      <section className="bg-sky-50 border rounded-xl p-4">
        <h3 className="text-sky-700 font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input label="Invoice No" value={filters.invoiceNo} onChange={(e) => setFilters({...filters, invoiceNo: e.target.value})} />
          <Select label="Supplier Name" value={filters.supplier} onChange={(e) => setFilters({...filters, supplier: e.target.value})}>
            <option value="">-- All --</option>
            <option>Supplier 1</option><option>Supplier 2</option>
          </Select>
          <Select label="Item Type" value={filters.itemType} onChange={(e) => setFilters({...filters, itemType: e.target.value})}>
            <option value="">-- All --</option>
            {ITEM_TYPES.map(t => <option key={t}>{t}</option>)}
          </Select>
          <Input label="Item Name" value={filters.itemName} onChange={(e) => setFilters({...filters, itemName: e.target.value})} />
          <Input type="date" label="Date From" value={filters.dateFrom} onChange={(e) => setFilters({...filters, dateFrom: e.target.value})} />
          <Input type="date" label="Date To" value={filters.dateTo} onChange={(e) => setFilters({...filters, dateTo: e.target.value})} />
        </div>
        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={handleSearch}>Search</Button>
          <Button variant="gray" onClick={handleReset}>Cancel</Button>
          <Button variant="gray" onClick={() => window.print()}>Print</Button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input label="Total Cost Price (₹)" value={summary.totalCp} readOnly />
        <Input label="Total MRP (₹)" value={summary.totalMrp} readOnly />
        <Input label="Total Recv. Quantity" value={summary.recvQty} readOnly />
        <Input label="Total Recv. Free Quantity" value={summary.freeQty} readOnly />
        <Input label="Total Sales Amount (₹)" value={summary.salesAmount} readOnly />
        <Input label="Total Balance Quantity" value={summary.balanceQty} readOnly />
        <Input label="Total Sales Quantity" value={summary.salesQty} readOnly />
        <Input label="Remaining Cost Price (₹)" value={summary.remainingCp} readOnly />
        <Input label="Total Cond. Quantity" value={summary.condQty} readOnly />
      </section>
      
      <div className="flex justify-end">
        <Button variant="green">Update Stock</Button>
      </div>
    </div>
  );
};

export default StockDetails;