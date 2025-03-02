import React, { useState } from "react";
import { FileType, ArrowRight } from "lucide-react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import ConvertFiles from "../components/ConvertFiles";
import { useApp } from "@/context/AppContext";

const fileFormats = [
  { value: "pdf", label: "PDF" },
  { value: "jpeg", label: "JPEG" },
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "docx", label: "DOCX" },
  { value: "txt", label: "TXT" },
];

const FileConverter = () => {
  const { files } = useApp(); // Use files directly from context
  const { user } = useUser();
  const api_url = import.meta.env.VITE_BACKEND_URL;
  const convert_url = import.meta.env.VITE_API_URL;

  const [selectedFile, setSelectedFile] = useState(null);
  const [toFormat, setToFormat] = useState("");
  const [isConverting, setIsConverting] = useState(false);

  const handleSelectFile = (file) => {
    setSelectedFile((prev) => (prev && prev.id === file.id ? null : file));
    setToFormat("");
  };

  const handleConvert = async () => {
    if (!selectedFile || !toFormat) {
      alert("Please select a file and a target format");
      return;
    }

    setIsConverting(true);
    try {
      const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
      const response = await axios.post(
        `${convert_url}/files/convert`,
        {
          fromFormat: fileExtension,
          toFormat,
          fileUrl: selectedFile.url,
        },
        {
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${selectedFile.name.split(".").slice(0, -1).join(".")}.${toFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error("Conversion failed");
      }
    } catch (error) {
      console.error("Error converting file:", error);
      alert("Error converting file. Please try again.");
    } finally {
      setIsConverting(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setToFormat("");
  };

  return (
    <main className="flex-1 p-6 overflow-y-auto m-10 rounded-2xl bg-[#F2F6FE]">
      <h1 className="text-3xl font-semibold mb-4 text-[#3B4B76] flex items-center">
        <FileType className="mr-2" size={32} /> File Converter
      </h1>
      <hr className="h-[3px] my-5 border-0 bg-[#95ADDC]" />
      {selectedFile ? (
        <div>
          <div className="mb-6">
            <button
              onClick={clearSelection}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to file list
            </button>
          </div>
          <div className="border p-6 bg-white shadow rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-2">File Details</h3>
            <p className="mb-2">
              <strong>Name:</strong> {selectedFile.name}
            </p>
            <p className="mb-4">
              <strong>Format:</strong> {selectedFile.fileType}
            </p>

            <div className="flex justify-center mt-6 space-x-4">
              <div>
                <label className="block text-gray-700 mb-2">From</label>
                <input
                  className="border border-gray-300 p-2 rounded-lg w-40 bg-gray-200 cursor-not-allowed"
                  value={selectedFile.name.split('.').pop().toUpperCase()}
                  disabled
                />
              </div>
              <ArrowRight size={32} className="text-gray-500" />
              <div>
                <label className="block text-gray-700 mb-2">To</label>
                <select
                  className="border border-gray-300 p-2 rounded-lg w-40"
                  value={toFormat}
                  onChange={(e) => setToFormat(e.target.value)}
                >
                  <option value="">Select format</option>
                  {fileFormats
                    .filter((format) => format.value !== selectedFile.fileType)
                    .map((format) => (
                      <option key={format.value} value={format.value}>
                        {format.label}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <button
              className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:bg-gray-400 flex justify-center items-center gap-2"
              onClick={handleConvert}
              disabled={isConverting || !toFormat}
            >
              {isConverting ? "Converting..." : "Convert File"}
            </button>
          </div>
        </div>
      ) : (
        <ConvertFiles
          files={files}
          onSelectFile={handleSelectFile}
          selectedFileId={selectedFile ? selectedFile.id : null}
        />
      )}
    </main>
  );
};

export default FileConverter;
