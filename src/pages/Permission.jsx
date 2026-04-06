import React, { useState, useEffect } from "react";
import { KeyIcon } from "@heroicons/react/24/solid";

const Permission = () => {
  const [form, setForm] = useState({
    action: "",
    resource: "",
  });

  const [actions, setActions] = useState([]);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    setActions(["read", "create", "update", "delete", "assign"]);
    setResources(["user", "role", "permission", "tenant"]);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const payload = {
      action: form.action,
      resource: form.resource,
    };

    console.log("FINAL PAYLOAD:", payload);
  };

  return (
    <div className="p-8 space-y-8 bg-gray-100 min-h-screen">

     
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-[2.5rem] p-6 flex items-center gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <KeyIcon className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              Create Permission
            </h2>
            <p className="text-xs opacity-80">
              Action & Resource Mapping
            </p>
          </div>
        </div>
      </div>

      
      <div className="bg-white rounded-2xl shadow-md p-6 space-y-6 border border-gray-200">

        
        <div>
          <label className="text-sm font-medium text-gray-700">
            Action
          </label>

          <select
            name="action"
            value={form.action}
            onChange={handleChange}
            className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Select Action</option>
            {actions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        
        <div>
          <label className="text-sm font-medium text-gray-700">
            Resource
          </label>

          <select
            name="resource"
            value={form.resource}
            onChange={handleChange}
            className="w-full mt-1 p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Select Resource</option>
            {resources.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Save Permission
          </button>
        </div>
      </div>
    </div>
  );
};

export default Permission;