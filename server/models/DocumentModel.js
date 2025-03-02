import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
    Document_id: {
        type: String,
    },
    content: Object,
    document_name: String,
    owner: {
        type: String,
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    SharedLink: [
        {
            linkId: { type: String, required: true },
            permission: { type: String, enum: ["view", "edit"], required: true }
        }
    ],
    DocumentBrief: {
            type: Object,
    }

})
export const Documents = mongoose.models.Documents || mongoose.model('Documents', DocumentSchema);