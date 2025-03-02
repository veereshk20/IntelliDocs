import mongoose from "mongoose";

export const GroupSchema = new mongoose.Schema({
    User_id:{
        type:String,
    },
    Groups :{
        type: Object,
    },
});


export const Groups = mongoose.models.Groups || mongoose.model('Groups', GroupSchema); 