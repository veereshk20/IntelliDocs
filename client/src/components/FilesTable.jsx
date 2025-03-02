/* eslint-disable react/prop-types */
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, User } from "lucide-react";
import React, { useEffect, useState } from "react";
import "@cyntler/react-doc-viewer/dist/index.css";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { useApp } from "@/context/AppContext";
import { Button } from "./ui/button";
import { SquareCheckBig } from 'lucide-react';
import DocumentViewer from "./DocumentViewer";
const api_url = import.meta.env.VITE_BACKEND_URL;

const colorClasses = [
  { bg: "bg-red-300", text: "text-red-500" },
  { bg: "bg-blue-300", text: "text-blue-500" },
  { bg: "bg-green-300", text: "text-green-500" },
  { bg: "bg-yellow-300", text: "text-yellow-500" },
  { bg: "bg-purple-300", text: "text-purple-500" },
  { bg: "bg-pink-300", text: "text-pink-500" },
  { bg: "bg-indigo-300", text: "text-indigo-500" },
  { bg: "bg-orange-300", text: "text-orange-500" },
];

export default function FileTable({ files, isStarredPage, location}) {
  const navigate = useNavigate();
  // const location = useLocation();

  const [fileData, setFileData] = useState([]);
  const { user } = useApp();

  // Extract selected file URL from query parameters
  const queryParams = new URLSearchParams(location.search);
  const selectedUrl = queryParams.get("file");
  const [file, setFile] = useState("");

  useEffect(() => {
    if (files && files.length > 0) {
      setFileData(files.filter((file) => (isStarredPage ? file.starred : true)));
    }

    const handlePopState = () => {
      if (selectedUrl) {
        navigate(location.pathname);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [selectedUrl, navigate, location, setFileData, files, isStarredPage]);

  const toggleStar = (fileId) => {
    setFileData((prevFiles) => {
      // const responseuser = await axios.get(`${api_url}/getuser?user_name=${user.username}`);
      // const userid = responseuser.user_id;
      // const response = await axios.put(`${api_url}/${userid}/files/${fileId}`);
      // if(response.status !== 200){
      //   throw new Error("Failed to fetch files");
      // }
      return prevFiles
        .map((file) =>
          file.id === fileId ? { ...file, starred: !file.starred } : file
        )
        .filter((file) => (isStarredPage ? file.starred : true));
    });
  };

  const handleRowClick = (fileUrl, file) => {
    setFile(file);
    if(typeof(fileUrl)=="string"){
      navigate(`?file=${encodeURIComponent(fileUrl)}`);
    }else{
      navigate(`?file=${encodeURIComponent(fileUrl)}`);
    }
    
  };

  const handleBack = () => {
    navigate(location.pathname);
  };

  return (
    <div>
      {selectedUrl ? (
        <DocumentViewer selectedUrl={selectedUrl} handleBack={handleBack} file={file}/>
      ) : (
        <Card className="p-4 bg-blue-50">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-100">
                <TableHead className="w-12"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Modified at</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Collaborators</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fileData.map((file, index) => {
                // Safely parse response_json only if it's a string
                    const responseJson =
                    typeof file?.brief?.response_json === "string"
                      ? JSON.parse(file.brief.response_json)
                      : file?.brief?.response_json || {};

                  // Extract the first tag safely
                  const tags = responseJson?.tags || [];

                  return(
                  <TableRow key={index} className="border-b">
                  <TableCell className="text-center cursor-pointer" onClick={() => toggleStar(file.id)}>
                    <Star
                      key={index}
                      className={`h-5 w-5 transition-colors ${
                        file.starred ? "text-yellow-500 fill-yellow-500" : "text-gray-400"
                      }`}
                    />
                  </TableCell>
                  <TableCell className="gap-2 cursor-pointer" onClick={() => handleRowClick(file.url, file)}>
                    <span className="text-blue-500">📄</span> {file.name}
                      {/* Tags Displayed Below the File Name */}
                      <div className="mt-1 flex flex-wrap gap-1">
                        {tags.length > 0 ? (
                          tags.map((tag, i) => (
                            <span key={i} className="bg-gray-200 text-gray-700 px-2 py-1 text-sm rounded">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No tags</span>
                        )}
                      </div>   


                  </TableCell>
                  <TableCell onClick={() => handleRowClick(file.url, file)}>{file.modifiedAt}</TableCell>
                  <TableCell onClick={() => handleRowClick(file.url, file)}>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-4 shadow-md">
                        <AvatarFallback>👤</AvatarFallback>
                      </Avatar>
                      {file.owner}            
                    </div>
                  </TableCell>
                  <TableCell onClick={() => handleRowClick(file.url, file)}>
                    <div className="flex items-center">
                      {file.collaborators.map((col, i) => {
                        const colorIndex = i % colorClasses.length;
                        const { bg, text } = colorClasses[colorIndex];
                        return (
                          <Avatar
                            key={i}
                            className={`h-10 w-10 flex items-center justify-center ${text} font-bold shadow-md -ml-2`}
                          >
                            <AvatarFallback className={bg}>{col}</AvatarFallback>
                          </Avatar>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
                  )
              })}
            </TableBody>    
          </Table>
        </Card>
      )}
    </div>
  );
}
