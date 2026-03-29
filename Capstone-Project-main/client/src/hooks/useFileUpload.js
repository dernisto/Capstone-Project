import { useState, useCallback, useRef } from "react";
function generateId() {
  return Math.random().toString(36).substring(2, 15);
}
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
const DEFAULT_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf"
];
const DEFAULT_MAX_SIZE = 10 * 1024 * 1024;
function useFileUpload({
  uploadFn,
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX_SIZE
}) {
  const [files, setFiles] = useState([]);
  const uploadingRef = useRef(/* @__PURE__ */ new Set());
  const uploadFile = useCallback(
    async (pendingFile) => {
      if (uploadingRef.current.has(pendingFile.id)) return;
      uploadingRef.current.add(pendingFile.id);
      try {
        const uploadedUrl = await uploadFn(pendingFile.file);
        setFiles(
          (prev) => prev.map(
            (f) => f.id === pendingFile.id ? { ...f, status: "success", uploadedUrl } : f
          )
        );
      } catch (err) {
        setFiles(
          (prev) => prev.map(
            (f) => f.id === pendingFile.id ? {
              ...f,
              status: "error",
              error: err instanceof Error ? err.message : "Upload failed"
            } : f
          )
        );
      } finally {
        uploadingRef.current.delete(pendingFile.id);
      }
    },
    [uploadFn]
  );
  const addFiles = useCallback(
    (input) => {
      const newFiles = [];
      for (const file of Array.from(input)) {
        const isAccepted = accept.includes(file.type) || accept.some((a) => a.endsWith("/*") && file.type.startsWith(a.replace("/*", "/")));
        if (!isAccepted) {
          console.warn(`File type ${file.type} not accepted`);
          continue;
        }
        if (file.size > maxSize) {
          console.warn(`File ${file.name} exceeds max size`);
          continue;
        }
        newFiles.push({
          id: generateId(),
          file,
          previewUrl: URL.createObjectURL(file),
          status: "uploading"
        });
      }
      if (newFiles.length > 0) {
        setFiles((prev) => [...prev, ...newFiles]);
        newFiles.forEach(uploadFile);
      }
    },
    [accept, maxSize, uploadFile]
  );
  const removeFile = useCallback((id) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);
  const retryUpload = useCallback(
    (id) => {
      const file = files.find((f) => f.id === id);
      if (!file) return;
      setFiles(
        (prev) => prev.map(
          (f) => f.id === id ? { ...f, status: "uploading", error: void 0 } : f
        )
      );
      uploadFile({ ...file, status: "uploading" });
    },
    [files, uploadFile]
  );
  const clearFiles = useCallback(() => {
    files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setFiles([]);
  }, [files]);
  const getUploadedFiles = useCallback(() => {
    return files.filter((f) => f.status === "success" && f.uploadedUrl).map((f) => ({
      type: "file",
      url: f.uploadedUrl,
      mediaType: f.file.type,
      filename: f.file.name
    }));
  }, [files]);
  const isUploading = files.some((f) => f.status === "uploading");
  const hasErrors = files.some((f) => f.status === "error");
  const isComplete = files.length > 0 && files.every((f) => f.status === "success");
  const isEmpty = files.length === 0;
  return {
    files,
    addFiles,
    removeFile,
    retryUpload,
    clearFiles,
    getUploadedFiles,
    isUploading,
    hasErrors,
    isComplete,
    isEmpty
  };
}
export {
  fileToBase64,
  useFileUpload
};
