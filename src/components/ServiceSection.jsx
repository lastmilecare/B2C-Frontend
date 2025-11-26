import React, { useState, useEffect } from "react";
import { useGetServiceMastersQuery } from "../redux/apiSlice";
import useDebounce from "../hooks/useDebounce";
import { TrashIcon } from "@heroicons/react/24/outline";
import { healthAlert } from "../utils/healthSwal";
const ServiceSection = ({
  selectedServices,
  setSelectedServices,
  department,
  consultingDoctor,
  payMode,
  setBillingTotals
}) => {
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [warning, setWarning] = useState("");

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data = [], isLoading } = useGetServiceMastersQuery(debouncedSearch);

  const serviceOptions = data.map((item) => ({
    id: item.ID,
    type: item.ServiceType || "General",
    name: item.ServiceName,
    price: item.ServiceCharge,
    HospitalID: item.HospitalID,
    ServiceTypeID: item.ServiceTypeID
  }));

  const canAdd = department && consultingDoctor;

  const handleAddService = (service) => {
    if (!canAdd) {
      healthAlert({
        title: "UHID Required",
        text: "Please select a UHID, Department and Doctor from the list",
        icon: "warning",
      });
      return;
    }
    if (!selectedServices.some((s) => s.id === service.id)) {
      setSelectedServices([...selectedServices, { ...service, quantity }]);
    }
    setSearchTerm("");
  };


  const handleRemoveService = (id) => {
    setSelectedServices(selectedServices.filter((s) => s.id !== id));
  };

  useEffect(() => {
    const total = selectedServices.reduce(
      (sum, item) => sum + item.price * Number(item.quantity),
      0
    );

    setBillingTotals(total, payMode); // pass payMode explicitly
  }, [selectedServices, payMode]);




  return (
    <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 mt-4">
      <h3 className="text-lg font-semibold text-sky-700 mb-3">🧾 Service Details</h3>

      {warning && (
        <p className="text-red-600 text-sm mb-2">{warning}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-gray-600">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />
        </div>

        <div className="col-span-2 relative">
          <label className="text-sm text-gray-600">Service Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            placeholder="Search service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`border rounded-lg px-3 py-2 w-full 
              }`}
          />

          {searchTerm && (
            <ul className="absolute z-50 bg-white border border-gray-200 mt-1 rounded-lg shadow-md w-full max-h-40 overflow-y-auto">
              {isLoading ? (
                <li className="px-3 py-2 text-gray-500 text-sm">Loading...</li>
              ) : serviceOptions.length > 0 ? (
                serviceOptions.map((service) => (
                  <li
                    key={service.id}
                    onClick={() => handleAddService(service)}
                    className="px-3 py-2 cursor-pointer hover:bg-sky-100"
                  >
                    {service.name} — ₹{service.price}
                  </li>
                ))
              ) : (
                <li className="px-3 py-2 text-gray-500 text-sm">No match found</li>
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm text-gray-600 mb-1 block">Selected Services</label>

        {selectedServices.length > 0 ? (
          <div className="overflow-x-auto border border-gray-300 rounded-lg bg-white">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-2 text-center">SL No</th>
                  <th className="p-2 text-center">Service ID</th>
                  <th className="p-2 text-center">Type</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-center">Charge</th>
                  <th className="p-2 text-center">Net</th>
                  <th className="p-2 text-center">Delete</th>
                </tr>
              </thead>

              <tbody>
                {selectedServices.map((service, index) => (
                  <tr key={service.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 text-center">{index + 1}</td>
                    <td className="p-2 text-center">{service.id}</td>
                    <td className="p-2 text-center">{service.type}</td>
                    <td className="p-2 text-left">{service.name}</td>
                    <td className="p-2 text-center">{service.quantity}</td>
                    <td className="p-2 text-center">₹{service.price}</td>
                    <td className="p-2 text-center">₹{service.price * service.quantity}</td>
                    <td className="p-2 text-center">
                      <TrashIcon
                        className="h-5 w-5 text-red-500 cursor-pointer hover:text-red-700 "
                        onClick={() => handleRemoveService(service.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">No services added yet.</p>
        )}
      </div>

    </div>
  );
};

export default ServiceSection;
