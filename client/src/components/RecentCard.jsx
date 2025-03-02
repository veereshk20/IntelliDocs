import React from "react";
import fileIcon from "@/assets/file.svg"

export default function RecentFiles({ name, date, size }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-md flex items-center gap-3 w-64 h-30"> {/* Set a fixed width and height */}
      <img src={fileIcon} alt={name} className="w-auto h-5" />
      <div className="overflow-hidden flex flex-col justify-center flex-1"> {/* Use flex to align content properly */}
        <h3 className="font-bold truncate">{name}</h3> {/* Truncate long text */}
        <p className="text-sm text-gray-600 truncate">{date}</p> {/* Truncate long text */}
      </div>
    </div>
  );
}