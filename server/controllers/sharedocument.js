import { Documents } from "../models/DocumentModel.js";
import crypto from 'crypto';
import { File } from "../models/FileModel.js";
export const sharelink = async (req, res) => {
    try {

        const { permission } = req.body;
        const { id } = req.params;
        console.log("id is",id);
        if (!["view", "edit"].includes(permission)) {
            return res.status(400).json({ error: "Invalid permission type" });
        }
        const document = await Documents.findOne({Document_id:id});
        if (!document) {
            try {
                const file = await File.findOne({File_id:id});
                if (!file) {
                    return res.status(404).json({ error: "File not found" });
                }
                const linkId = crypto.randomBytes(8).toString("hex");
                file.SharedLink.push({ linkId, permission });
                await file.save();
                const sharedURL = `http://localhost:9000/shared/${linkId}`;
                return res.json({ message: "Shareable link generated", sharedURL, permission });
            }
            catch (error) {
                console.error("❌ Error generating shareable link:", error);
                res.status(500).json({ error: "Server error" });
            }

        }

        // Generate a unique link ID
        const linkId = crypto.randomBytes(8).toString("hex");
        console.log("linkId is",linkId);
        console.log("permission is",permission);
        // Store the shared link
        console.log("document is ",document);
        document.SharedLink.push({ linkId, permission });
        await document.save();

        const sharedURL = `http://localhost:9000/shared/${linkId}`;
        res.json({ message: "Shareable link generated", sharedURL, permission });
    } catch (error) {
        console.error("❌ Error generating shareable link:", error);
        res.status(500).json({ error: "Server error" });
    }
}

export const viewDoc=("/shared/:linkId", async (req, res) => {
    try {
        const { linkId } = req.params;

        console.log("linkId is",linkId);

        const document = await Documents.findOne({ "SharedLink.linkId": linkId });
        console.log("document is",document);
        if (!document) {
            try {
                const file = await File.findOne({ "SharedLink.linkId": linkId });
                if (!file) {
                    return res.status(404).json({ error: "Invalid or expired link" });
                }
                const sharedLink = file.SharedLinks.find(link => link.linkId === linkId);
                return res.json({ file, permission: sharedLink.permission });
            }
            catch (error) {
                console.error("❌ Error accessing shared document:", error);
                res.status(500).json({ error: "Server error" });
            }

        }

        const sharedLink = document.SharedLink.find(link => link.linkId === linkId);

        res.json({ document, permission: sharedLink.permission });
    } catch (error) {
        console.error("❌ Error accessing shared document:", error);
        res.status(500).json({ error: "Server error" });
    }
});

export const updateDoc=("/shared/:linkId", async (req, res) => {
    try {
        const { linkId } = req.params;
        const { content } = req.body;

        const document = await Documents.findOne({ "SharedLink.linkId": linkId });
        if (!document) {
            return res.status(404).json({ error: "Invalid or expired link" });
        }

        const sharedLink = document.SharedLink.find(link => link.linkId === linkId);

        if (sharedLink.permission !== "edit") {
            return res.status(403).json({ error: "You do not have permission to edit this document" });
        }

        document.content = content;

        await document.save();

        res.json({ message: "Document updated successfully" });
    } catch (error) {
        console.error("❌ Error updating shared document:", error);
        res.status(500).json({ error: "Server error" });
    }
});
