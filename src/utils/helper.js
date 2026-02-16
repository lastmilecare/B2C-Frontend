// Generate readable filename
export const generateFileName = (baseName, options = {}) => {
  const sanitize = (name) =>
    name.replace(/[^a-zA-Z0-9-_]/g, "_");

  const safeBase = sanitize(baseName);
  const extension = options.extension || "xlsx";

  const now = new Date();

  const formatDate = (date) =>
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");

  const formatTime = (date) =>
    String(date.getHours()).padStart(2, "0") +
    "-" +
    String(date.getMinutes()).padStart(2, "0") +
    "-" +
    String(date.getSeconds()).padStart(2, "0");

  if (options.dateFrom && options.dateTo) {
    return (
      safeBase +
      "_" +
      options.dateFrom +
      "_to_" +
      options.dateTo +
      "." +
      extension
    );
  }

  return (
    safeBase +
    "_" +
    formatDate(now) +
    "_" +
    formatTime(now) +
    "." +
    extension
  );
};


export const downloadBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(url);
};
