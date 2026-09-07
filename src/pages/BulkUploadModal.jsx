import React, { useRef, useState } from "react";
import { healthAlert } from "../../utils/healthSwal";

const ACCEPTED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const BulkUploadModal = ({
  isOpen,
  onClose,
  onSuccess,
  downloadTemplate,
  uploadFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.endsWith(".xlsx")) {
      healthAlert({
        title: "Invalid File",
        text: "Only .xlsx Excel files are accepted",
        icon: "error",
      });
      return;
    }

    setSelectedFile(file);
    setResult(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      await downloadTemplate();
    } catch {
      healthAlert({
        title: "Download Failed",
        text: "Could not download template. Please try again.",
        icon: "error",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      healthAlert({
        title: "No File Selected",
        text: "Please select an Excel file to upload",
        icon: "info",
      });
      return;
    }

    try {
      setUploading(true);
      const uploadResult = await uploadFile(selectedFile);
      setResult(uploadResult);

      if (uploadResult.successCount > 0) {
        onSuccess();
      }

      if (uploadResult.failureCount === 0) {
        healthAlert({
          title: "Upload Complete",
          text: `${uploadResult.successCount} patient(s) registered successfully`,
          icon: "success",
        });
      }
    } catch (err) {
      healthAlert({
        title: "Upload Failed",
        text: err?.data?.message || err?.message || "Something went wrong",
        icon: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            Bulk Upload Patients
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">How it works</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Download the Excel template</li>
              <li>
                Fill in patient details using <strong>names</strong> (not IDs)
                for Country, State, District, Department, Designation
              </li>
              <li>Reference sheets in the template list valid values</li>
              <li>Upload the completed .xlsx file</li>
            </ol>
          </div>

          <button
            onClick={handleDownloadTemplate}
            disabled={downloading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-green-400 rounded-lg text-green-700 hover:bg-green-50 transition disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            {downloading ? "Downloading..." : "Download Excel Template"}
          </button>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Excel File (.xlsx only)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="mt-1 text-xs text-gray-500">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {result && (
            <div className="space-y-3">
              <div className="flex gap-4">
                <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{result.successCount}</p>
                  <p className="text-xs text-green-600">Successful</p>
                </div>
                <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-700">{result.failureCount}</p>
                  <p className="text-xs text-red-600">Failed</p>
                </div>
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-700">{result.totalRows}</p>
                  <p className="text-xs text-gray-600">Total Rows</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div className="max-h-48 overflow-y-auto border rounded-lg">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Row</th>
                        <th className="px-3 py-2 text-left">Error</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((err, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-1.5 font-mono">{err.row}</td>
                          <td className="px-3 py-1.5 text-red-600">{err.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            {result ? "Close" : "Cancel"}
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? "Uploading..." : "Upload & Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadModal;
