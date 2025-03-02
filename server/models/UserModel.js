import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    User_id: {
        type: String,
    },


    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
    },

    user_name: {
        type: String,
        required: true,
        unique: true
    },

    Document_id: [
        {
            type: String,
            ref: 'Documents'
        }
    ],
    File_id: [
        {
            type: String,
            ref: 'Files'
        }
    ]


}, { minimize: false });

export const Users = mongoose.models.Users || mongoose.model('Users', userSchema);