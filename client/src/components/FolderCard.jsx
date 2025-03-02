import React from "react";
import folderIcon from "@/assets/folder.svg"; // Ensure you have the folder icon in the assets folder

export default function FolderCard({ name, fileCount, size }) {
  return (
    <div className="bg-blue-100 rounded-xl p-4 shadow-md flex flex-col items-left w-40 min-w-[260px]">
      <img src={folderIcon} alt="Folder Icon" className="w-12 h-12 mb-2" />
      <h3 className="font-bold text-left text-sm">{name}</h3>
      <p className="text-xs text-gray-600 text-left">{fileCount} Files • {size} MB</p>
    </div>
  );
}
