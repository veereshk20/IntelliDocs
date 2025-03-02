import tmp from "tmp-promise";
import fs from "fs-extra";
import axios from "axios";
import path from "path";
import { fileConverter } from "../utils/fileConverter.js"; // Conversion Logic

export const fileController = async (req, res) => {
    const { fromFormat, toFormat, fileUrl } = req.body;
    
    if (!fromFormat || !toFormat || !fileUrl) {
        return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
        // Create a temporary directory
        const tempDir = await tmp.dir({ unsafeCleanup: true });

        // Define input and output paths
        const inputPath = path.join(tempDir.path, `input.${fromFormat}`);
        const outputPath = path.join(tempDir.path, `output.${toFormat}`);

        // Download the file
        console.log("Downloading file from:", fileUrl);
        const response = await axios({ url: fileUrl, responseType: "arraybuffer" });
        await fs.writeFile(inputPath, response.data);

        // Convert the file
        console.log("Converting file...");
        const success = await fileConverter(inputPath, outputPath, toFormat);

        if (!success) {
            return res.status(400).json({ message: "Conversion failed" });
        }

        // Send converted file
        res.setHeader("Content-Disposition", `attachment; filename="converted.${toFormat}"`);
        res.setHeader("Content-Type", "application/octet-stream");
        res.download(outputPath, `converted.${toFormat}`, async (err) => {
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).json({ message: "Error downloading file" });
            }
            await fs.remove(tempDir.path); // Cleanup
        });
    } catch (error) {
        console.error("Error in file conversion:", error);
        return res.status(500).json({ message: error.message });
    }
};
