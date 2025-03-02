import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";

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

const ConvertFiles = ({ files, onSelectFile, selectedFileId }) => {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-100">
            <TableHead>Name</TableHead>
            <TableHead>Modified at</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Collaborators</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file, index) => (
            <TableRow key={index} className="border-b hover:bg-blue-100">
              <TableCell className="gap-2" onClick={() => onSelectFile(file)}>
                <span className="text-blue-500">📄</span> {file.name}
              </TableCell>
              <TableCell onClick={() => onSelectFile(file)}>{file.modifiedAt}</TableCell>
              <TableCell onClick={() => onSelectFile(file)}>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-4 shadow-md">
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
                  {file.owner}
                </div>
              </TableCell>
              <TableCell onClick={() => onSelectFile(file)}>
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ConvertFiles;
