import React, { useState } from "react";

const ServiceSection = ({ selectedServices, setSelectedServices }) => {
  const serviceOptions = [
    { id: 1, name: "OPD Consultation", price: 500 },
    { id: 2, name: "Pathology Test", price: 300 },
    { id: 3, name: "X-Ray", price: 400 },
    { id: 4, name: "MRI Scan", price: 2500 },
    { id: 5, name: "Blood Sugar Test", price: 150 },
  ];

  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = serviceOptions.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddService = (service) => {
    if (!selectedServices.some((s) => s.id === service.id)) {
      setSelectedServices([...selectedServices, { ...service, quantity }]);
    }
    setSearchTerm("");
  };

  const handleRemoveService = (id) => {
    setSelectedServices(selectedServices.filter((s) => s.id !== id));
  };

  return (
    <div className="bg-sky-50 p-4 rounded-xl border border-sky-100 mt-4">
      <h3 className="text-lg font-semibold text-sky-700 mb-3">
        🧾 Service Details
      </h3>

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
          <label className="text-sm text-gray-600">Service Name</label>
          <input
            type="text"
            placeholder="Search service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          />
          {searchTerm && (
            <ul className="absolute z-50 bg-white border border-gray-200 mt-1 rounded-lg shadow-md w-full max-h-40 overflow-y-auto">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
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

      {/* Selected Services */}
      <div className="mt-4">
        <label className="text-sm text-gray-600 mb-1 block">Selected Services</label>
        {selectedServices.length > 0 ? (
          <div className="border border-gray-300 rounded-lg bg-white text-sm p-3">
            {selectedServices.map((service, index) => (
              <div
                key={service.id}
                className="flex justify-between items-center border-b last:border-b-0 py-1"
              >
                <span>
                  {index + 1}. {service.name} — ₹{service.price} × {service.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveService(service.id)}
                  className="text-red-500 hover:text-red-700 text-xs font-semibold"
                >
                  ❌ Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">No services added yet.</p>
        )}
      </div>
    </div>
  );
};

export default ServiceSection;
