import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user: clerkUser, isSignedIn } = useUser();
  const [user, setUser] = useState(null); // Store user details
  const [files, setFiles] = useState([]); // Store files

  const api_url = import.meta.env.VITE_BACKEND_URL; // Replace with your actual API URL

  // Fetch files whenever user changes
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      console.log("Clerk user found:", clerkUser);
      setUser({
        username: clerkUser.username,
        email: clerkUser.primaryEmailAddress,
      });
    }
  }, [clerkUser, isSignedIn]);

  // ✅ Fetch files only after user is set
  useEffect(() => {
    const fetchFiles = async () => {
      if (!user) return;
      try {
        console.log(user)
        console.log("Fetching files for user:", user.username);

        const user_id = await axios.get(`${api_url}/getuser?user_name=${user.username}`);
        console.log("User ID Response:", user_id);

        const response = await axios.get(`${api_url}/${user_id.data.user_id}/files`);
        console.log("Files Response:", response.data);


        const responsedocs = await axios.get(`${api_url}/${user_id.data.user_id}/docs`);
        console.log("Files Response:", responsedocs.data);

        if (response.status !== 200) throw new Error("Failed to fetch files");

        if (responsedocs.status !== 200) throw new Error("Failed to fetch docs");

        const fileArray = response.data.files.map((file, index) => ({
          id: file.fileid,
          name: `${file.fileName}.${file.fileType}`,
          modifiedAt: new Date(file.modified_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          }),
          owner: file.owner,
          collaborators: file.collaborators,
          starred: file.starred,
          url: file.fileUrl,
          brief: file.breif,
        }));


        const docArray = responsedocs.data.files.map((file, index) => ({
          id: file.fileid,
          name: `${file.fileName}`,
          modifiedAt: new Date(file.modified_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          }),
          owner: file.owner,
          collaborators: file.collaborators,
          starred: file.starred,
          url: file.fileUrl,
          brief: file.breif,
        }));

        const result  = fileArray.concat(docArray);

        console.log("Processed File Array:", result);
        setFiles(result);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    if (user) fetchFiles(); // ✅ Fetch only when user is set
  }, [user, api_url]); // Runs whenever `user` changes

  return (
    <AppContext.Provider value={{ user, setUser, files, setFiles }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use AppContext
export const useApp = () => useContext(AppContext);
