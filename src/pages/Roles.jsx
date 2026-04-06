import React, { useState, useEffect } from "react";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";

const Roles = () => {
  const [form, setForm] = useState({
    role_title: "",
    tenant_id: "",
  });


  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    // � Future: API call
    // const res = await getTenants()
    // setTenants(res.data)

   
    setTenants([
      { id: 1, name: "LMC" },
      { id: 2, name: "Hospital A" },
    ]);
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
      role_title: form.role_title,
      tenant_id: Number(form.tenant_id), 
    };

    console.log("FINAL PAYLOAD:", payload);

    /*
      future API:
      await createRole(payload)
    */
  };

  return (
    <div className="p-8 space-y-8">
      
      
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-[2.5rem] p-6 flex items-center gap-4 shadow-xl">
        <ShieldCheckIcon className="h-8 w-8" />
        <div>
          <h2 className="text-3xl font-black uppercase">
            Create Role
          </h2>
          <p className="text-[10px] uppercase tracking-widest opacity-80">
            Role Setup
          </p>
        </div>
      </div>

     
      <div className="bg-white rounded-[2rem] shadow-xl p-6 space-y-6">
        
        
        <div>
          <label className="text-sm font-semibold">Role Name</label>
          <input
            type="text"
            name="role_title"
            value={form.role_title}
            onChange={handleChange}
            placeholder="Enter role name"
            className="w-full mt-1 p-3 border rounded-xl"
          />
        </div>

        
        <div>
          <label className="text-sm font-semibold">Tenant</label>
          <select
            name="tenant_id"
            value={form.tenant_id}
            onChange={handleChange}
            className="w-full mt-1 p-3 border rounded-xl"
          >
            <option value="">Select Tenant</option>

            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-emerald-600 text-white px-6 py-2 rounded-xl hover:bg-emerald-700"
          >
            Save Role
          </button>
        </div>
      </div>
    </div>
  );
};

export default Roles;