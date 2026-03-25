import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { healthAlerts } from "../utils/healthSwal";
import {
  useCreateItemMutation,
  useUpdateItemMutation,
  useGetComboQuery,
  useLazyGetMediceneListQuery,
  useActivateItemMutation,
  useInactivateItemMutation,
} from "../redux/apiSlice";
import { cookie } from "../utils/cookie";
import CommonList from "../components/CommonList";
const ItemMaster = () => {
  const [activateItem] = useActivateItemMutation();
  const [inactivateItem] = useInactivateItemMutation();
  const [editId, setEditId] = useState(null);
  const [createItem] = useCreateItemMutation();
  const [updateItem] = useUpdateItemMutation();
  const [searchClicked, setSearchClicked] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const getCookieUserId = () => {
    const id = Number(cookie.get("user_id")) || 0;
    return id;
  };
  const formik = useFormik({
    initialValues: {
      itemCode: "",
      itemid: "",
      description: "",
      itemtypeid: "",
      userloginid: 0,
      addedby: 0,
      subgroupid: "",
       storetype: "",
    },
    validationSchema: Yup.object({
      itemCode: Yup.string().required("Item Code is required"),
      description: Yup.string().required("Description is required"),
      itemtypeid: Yup.string().required("Item Type is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      const currentUserId = getCookieUserId();
      try {
        const payload = {
          code: values.itemCode,
          descriptions: values.description,
          itemtypeid: Number(values.itemtypeid),
          userloginid: currentUserId,
          addedby: currentUserId,
          subgroupid: 0,
          storetype: 0,
        };
        if (editId) {
          await updateItem({ id: editId, body: payload }).unwrap();
          healthAlerts.success("Item Updated Successfully");
          setEditId(null);
        } else {
          await createItem(payload).unwrap();
          healthAlerts.success("Item Added Successfully");
        }
        resetForm();
        formik.setFieldValue("userloginid", currentUserId);
        formik.setFieldValue("addedby", currentUserId);

      } catch (error) {
        console.log(error);
        healthAlerts.error("Something went wrong");
      }
    },
  });
  useEffect(() => {
    const id = getCookieUserId();
    if (id > 0) {
      formik.setFieldValue("userloginid", id);
      formik.setFieldValue("addedby", id);
    }
  }, []);
  const { data: medicineTypes = [] } = useGetComboQuery("medicine-type");
  const [fetchItems, { data }] = useLazyGetMediceneListQuery();
  const handleSearch = async () => {
    try {
      const result = await fetchItems({
        search: formik.values.description,
        code: formik.values.itemCode,
        itemtypeid: formik.values.itemtypeid,
      }).unwrap();

      setSearchResult(result.data || []);
      setSearchClicked(true);
    } catch (err) {
      healthAlerts.error("Search Failed");
    }
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
              name="itemtypeid"
              value={formik.values.itemtypeid}
              onChange={formik.handleChange}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">-- Select --</option>
              {medicineTypes?.map((type) => (
                <option key={type.ID} value={type.ID}>
                  {type.Descriptions}
                </option>
              ))}
            </select>
            {formik.touched.itemtypeid && formik.errors.itemtypeid}
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
          {searchClicked && (
            <CommonList
              title="Item Master List"
              columns={[
                {
                  name: "S.No",
                  selector: (row, index) => index + 1,
                  width: "80px",
                },
                {
                  name: "Item Code",
                  selector: (row) => row.code,
                },
                {
                  name: "Description",
                  selector: (row) => row.descriptions,
                },
                {
                  name: "Item Type",
                  selector: (row) => row.itemType?.Descriptions,
                },
                {
                  name: "Added Date",
                  selector: (row) =>
                    new Date(row.addeddate).toLocaleDateString(),
                },
                {
                  name: "Status",
                  selector: (row) =>
                    row.isactive ? (
                      <span className="text-green-600 font-semibold">Active</span>
                    ) : (
                      <span className="text-red-500 font-semibold">Inactive</span>
                    ),
                },
              ]}
              data={searchResult}
              enableActions
              actionButtons={["edit", "status"]}
              onEdit={(row) => {
                formik.setValues({
                  itemCode: row.code,
                  description: row.descriptions,
                  itemtypeid: row.itemtypeid,
                  userloginid: formik.values.userloginid,
                  addedby: formik.values.addedby,
                });
                setEditId(row.id);
              }}
              onStatus={async (row) => {
                try {
                  if (row.isactive) {
                    await inactivateItem(row.id).unwrap();
                    healthAlerts.success("Item Inactivated Successfully");
                  } else {
                    await activateItem(row.id).unwrap();
                    healthAlerts.success("Item Activated Successfully");
                  }

                  handleSearch(); 
                } catch (error) {
                  console.log(error);
                  healthAlerts.error("Operation Failed");
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
export default ItemMaster;