import FileTable from "@/components/FilesTable";
import { useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useState, useEffect } from "react";
import axios from "axios";
import { Group } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const api_url = import.meta.env.VITE_BACKEND_URL;

const Files = () => {
  const location = useLocation();
  const { user, files } = useApp();
  const [groupData, setGroupData] = useState({});
  const [open, setOpen] = useState(false); // Control Dialog visibility

  useEffect(() => {
    const fetchGroups = async () => {
      if (!user?.username) return; // Ensure user exists before fetching

      try {
        const user_id = await axios.get(`${api_url}/getuser?user_name=${user.username}`);

        console.log(user_id.data.user_id);

        const response = await axios.get(`${api_url}/${user_id.data.user_id}/groups`);
        if (response.status !== 200) throw new Error("Failed to fetch groups");

        console.log(response.data.Group.Groups);

        // Ensure the data is correctly structured
        const transformedGroups = response.data.Group.Groups.reduce((acc, obj) => {
          const [key, value] = Object.entries(obj)[0]; // Extract key-value pair
          acc[key] = value;
          return acc;
        }, {});

        setGroupData(transformedGroups);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    fetchGroups();
  }, [user]);

  return (
    <main className="flex-1 p-6 overflow-y-auto m-10 rounded-2xl" style={{ backgroundColor: "#F2F6FE" }}>
      <h1 className="text-3xl font-semibold mb-4">Files</h1>
      <hr className="h-[3px] my-5 border-0" style={{ backgroundColor: "#95ADDC" }} />

      {/* Smart Grouping Button */}
      <Button
        className="m-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 flex items-center gap-2"
        onClick={() => setOpen(true)}
      >
        <Group className="w-5 h-5" />
        Smart Grouping
      </Button>

      {/* Smart Grouping Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-6 rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle>Smart Grouping</DialogTitle>
            <DialogDescription>View categorized files.</DialogDescription>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-4">
            {Object.keys(groupData).length > 0 ? (
              Object.keys(groupData).map((groupName, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white shadow">
                  <h3 className="text-lg font-semibold text-gray-800">{groupName}</h3>
                  <ul className="mt-2 text-sm text-gray-600">
                    {groupData[groupName].map((file, i) => (
                      <li key={i} className="py-1">{file}</li>
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No groups available.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* File Table */}
      <FileTable files={files} isStarredPage={false} location={location} />
    </main>
  );
};

export default Files;
