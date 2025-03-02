import mongoose from 'mongoose';

const LastSeenSchema = new mongoose.Schema({

    User_id: {
        type: String,
    },
    File_id: {
        type: String,
    },

    Document_id: {
        type: String,

    },

    LastSeen: {
        type: Date,
        default: Date.now()
    },

    permission: {
        type: String,
        enum: ['edit', 'view', 'owner'],
    },

    starred: {
        type: Boolean,
        default: false,
    }


});

export const LastSeen = mongoose.models.LastSeen || mongoose.model('LastSeen', LastSeenSchema); 