/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SquareCheckBig } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Card } from "./ui/card";
import { Title } from "@radix-ui/react-dialog";

export default function DocumentViewer({ selectedUrl, handleBack, file }) {
  const [isOpen, setIsOpen] = useState(false);

  const responseJson =
  typeof file?.brief?.response_json === "string"
    ? JSON.parse(file.brief.response_json)
    : file?.brief?.response_json || {};

  const summary = responseJson?.summary && responseJson.summary.trim() !== ""
  ? responseJson.summary
  : "No summary available.";

  const medicalData = responseJson?.["Medical data"];
  
  /**
   * Recursive function to render any medical data dynamically
   */
  const renderData = (data) => {
    if (!data || typeof data !== "object") return null; // Handle empty or invalid data gracefully
  
    return Object.entries(data).map(([key, value]) => (
      <div key={key} className="mb-2">
        <strong className="text-gray-800">{key.replace(/_/g, " ")}:</strong>{" "}
        {typeof value === "object" ? (
          <div className="ml-4 border-l-2 border-gray-300 pl-2">
            {renderData(value)}
          </div>
        ) : (
          <span className="text-gray-600">{value}</span>
        )}
      </div>
    ));
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar with Buttons */}
      <div className="flex justify-between w-full mb-1 p-4 bg-white shadow-md">
        {/* Back Button - Left Aligned */}
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center gap-2"
        >
          ⬅ Back to Files
        </Button>

        {/* Summarise Button - Right Aligned */}
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 flex items-center gap-2"
        >
          <SquareCheckBig className="w-5 h-5" />
          Summarise
        </Button>
      </div>

      {/* Centered Document Viewer (Replace with actual DocViewer) */}
      <div className="flex-grow flex items-center justify-center">
        <div className="border w-3/4 h-full max-h-full flex items-center justify-center text-gray-500 overflow-hidden">
          <div className="w-full h-full overflow-auto">
            <DocViewer
              pluginRenderers={DocViewerRenderers}
              documents={[
                { uri: selectedUrl.includes("http") ? `${selectedUrl}?nocors=true` : selectedUrl}
              ]}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>


      {/* Summary Side Panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-96 p-4 flex flex-col">
          {/* Fixed Header */}
          <SheetHeader className="w-3/4 text-left bg-white z-10 p-4 ml-2 shadow-md">
            <SheetTitle className="text-left">{medicalData ? "📋 Medical Summary" : "📄 Summary"}</SheetTitle>
          </SheetHeader>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-2">
            {/* Render Medical Data Only If It Exists */}
            {medicalData && (
              <div>
                <Card className="p-4 shadow-lg bg-gray-100 rounded-lg">
                  <div className="mt-2">{renderData(medicalData)}</div>
                </Card>
                <Card className="w-3/4 text-left  p-4 m-2 shadow-lg">
                  <div className="mt-2">{"📄 Summary"}</div>
                </Card>              
                {/* <h2 className="text-lg font-semibold text-gray-800 mt-4"></h2> */}
              </div>
            )}

            {/* Render General Summary Only If It Exists */}
            <Card className="p-4 shadow-lg bg-gray-100 rounded-lg">
              <div className="mt-2">{summary}</div>
            </Card>
          
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
