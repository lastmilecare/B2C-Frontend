const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

async function toBlob(data) {
  if (data instanceof Blob) {
    return data.type
      ? data
      : new Blob([await data.arrayBuffer()], {
          type: XLSX_MIME,
        });
  }

  // ArrayBuffer
  if (data instanceof ArrayBuffer) {
    return new Blob([data], {
      type: XLSX_MIME,
    });
  }

  // Uint8Array
  if (data instanceof Uint8Array) {
    return new Blob([data], {
      type: XLSX_MIME,
    });
  }

  throw new TypeError(
    `Expected Blob, ArrayBuffer, or Uint8Array, got ${typeof data}`
  );
}

export async function downloadBlob(data, filename) {
  const blob = await toBlob(data);

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}

export function getBulkTemplateFilename() {
  const date = new Date().toISOString().split("T")[0];

  return `patient_bulk_upload_template_${date}.xlsx`;
}
