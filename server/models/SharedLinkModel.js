import mongoose from 'mongoose';

const SharedLinkSchema = new mongoose.Schema({
    LinkId: String,
    Permisson : Array

})
export const SharedLink = mongoose.models.SharedLink || mongoose.model('SharedLink', SharedLinkSchema);