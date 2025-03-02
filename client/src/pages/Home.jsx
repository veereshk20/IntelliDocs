import FolderCard from "@/components/FolderCard";
import RecentCard from "@/components/RecentCard";
import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";

export default function Home() {
  const [folders, setFolders] = useState([]);
  const {files} = useApp();
  const recentData = files.sort((filea, fileb) => fileb.modified_at - filea.modified_at)


   // Empty dependency array ensures it runs **only once** after the first render

  return (
    <main className="p-6 overflow-y-auto m-10 rounded-2xl" style={{ backgroundColor: "#F2F6FE" }}>
      <h1 className="text-3xl font-semibold mb-4">Home</h1>
      <hr className="h-[3px] my-5 border-0" style={{ backgroundColor: "#95ADDC" }} />

      {/* Folders Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Folders</h2>
        <div className="flex gap-4 overflow-x-auto py-5">
          {["Hack 2023", "Q-4 Results", "Annual Report", "Security"].map((folder, index) => (
            <FolderCard key={index} name={folder} fileCount={5} size="10MB" />
          ))}
        </div>
      </section>

      {/* Recent Files Section */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Recent</h2>
        <div className="flex gap-4 overflow-x-auto py-5">
          {recentData.map((file) => (
            <RecentCard key={file.id} name={file.name} date={file.modifiedAt} fileCount={3} size="5MB" />
          ))}
        </div>
      </section>
    </main>
  );
}
