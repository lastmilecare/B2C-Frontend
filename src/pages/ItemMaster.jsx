import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { healthAlerts } from "../utils/healthSwal";

const ItemMaster = () => {
  const [items, setItems] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const formik = useFormik({
    initialValues: {
      itemCode: "",
      description: "",
      itemType: "",
    },

    validationSchema: Yup.object({
      itemCode: Yup.string().required("Item Code is required"),
      description: Yup.string().required("Description is required"),
      itemType: Yup.string().required("Item Type is required"),
    }),

    onSubmit: (values, { resetForm }) => {
      const exists = items.some(
        (i) => i.itemCode.toLowerCase() === values.itemCode.toLowerCase()
      );

      if (exists) {
        healthAlerts.error("Item Code already exists", "Item Master");
        return;
      }

      setItems((prev) => [
        ...prev,
        {
          id: Date.now(),
          itemCode: values.itemCode,
          description: values.description,
          itemType: values.itemType,
        },
      ]);
      console.log("Form Submitted Successfully:", values);

      healthAlerts.success("Item Added Successfully", "Item Master");
      resetForm();
    },
  });
  const handleSearch = () => {
    const { itemCode, description, itemType } = formik.values;

    const result = items.filter((i) => {
      return (
        (itemCode
          ? i.itemCode.toLowerCase().includes(itemCode.toLowerCase())
          : true) &&
        (description
          ? i.description.toLowerCase().includes(description.toLowerCase())
          : true) &&
        (itemType ? i.itemType === itemType : true)
      );
    });

    setSearchResult(result);
    setSearchClicked(true);
  };
  return (
    <div className="max-w-6xl mx-auto mt-8 bg-white p-6 rounded-2xl shadow border">
      <h2 className="text-2xl font-bold text-sky-700 mb-6">
        🧾 Add New Item
      </h2>
      <form onSubmit={formik.handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm text-gray-600">
              Item Code <span className="text-red-500">*</span>
            </label>
            <input
              name="itemCode"
              value={formik.values.itemCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border rounded-lg px-3 py-2 w-full"
            />
            {formik.touched.itemCode && formik.errors.itemCode && (
              <p className="text-xs text-red-500">
                {formik.errors.itemCode}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-600">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border rounded-lg px-3 py-2 w-full"
            />
            {formik.touched.description &&
              formik.errors.description && (
                <p className="text-xs text-red-500">
                  {formik.errors.description}
                </p>
              )}
          </div>
          <div>
            <label className="text-sm text-gray-600">
              Item Type <span className="text-red-500">*</span>
            </label>
            <select
              name="itemType"
              value={formik.values.itemType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">-- Select --</option>
              <option>TABLET</option>
              <option>SYRUP</option>
              <option>INJECTION</option>
              <option>IV</option>
              <option>SOLUTION</option>
              <option>OTHERS</option>
            </select>
            {formik.touched.itemType && formik.errors.itemType && (
              <p className="text-xs text-red-500">
                {formik.errors.itemType}
              </p>
            )}
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="bg-sky-600 text-white px-4 py-2 rounded-lg"
            >
              Save
            </button>

            <button
              type="button"
              onClick={handleSearch}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() => {
                formik.resetForm();
                setSearchClicked(false);
              }}
              className="bg-gray-100 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>

        </div>
      </form>
      {searchClicked && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border text-sm">
            <thead className="bg-sky-100 text-sky-700">
              <tr>
                <th className="border px-2 py-2">ID</th>
                <th className="border px-2 py-2">Item Code</th>
                <th className="border px-2 py-2">Description</th>
                <th className="border px-2 py-2">Item Type</th>
                <th className="border px-2 py-2">Action</th>
              </tr>
            </thead>

            <tbody>
              {searchResult.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-4 text-gray-500"
                  >
                    No Items Found
                  </td>
                </tr>
              ) : (
                searchResult.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border px-2 py-2">
                      {item.itemCode}
                    </td>
                    <td className="border px-2 py-2">
                      {item.description}
                    </td>
                    <td className="border px-2 py-2">
                      {item.itemType}
                    </td>
                    <td className="border px-2 py-2 text-center">
                      <button
                        onClick={() =>
                          setItems((prev) =>
                            prev.filter((i) => i.id !== item.id)
                          )
                        }
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ItemMaster;