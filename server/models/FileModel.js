import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
    File_id: {
        type: String,
    },
    
    owner: {
        type: String,
    },

    content: String,

    type: String,
    
    filename: String,

    created_at: {
        type: Date,
        default: Date.now()
    },

    SharedLink:[
        {
            linkId: { type: String, required: true },
            permission: { type: String, enum: ["view", "edit"], required: true }
        }
    ],
    FileBrief: {
        type: Object,
    }
    

});

export const File = mongoose.models.File || mongoose.model('File', FileSchema);