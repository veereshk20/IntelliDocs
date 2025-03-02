import express from 'express';
import { getDocs, getFiles, getUser, regUser, toggleStarred } from '../controllers/userController.js';
import { deleteFile, fileUploader, renameFile } from '../controllers/fileUploader.js';
import upload from '../utils/multer.js';
import { sharelink,updateDoc,viewDoc } from '../controllers/sharedocument.js';
import { get } from 'mongoose';
import { getGroups } from "../controllers/groupController.js"

const userRouter = express.Router();

userRouter.post('/register', regUser);
userRouter.post('/upload', upload.array('file',6), fileUploader)
userRouter.get('/getuser', getUser)
userRouter.post('/:id/share',sharelink );
userRouter.get('/shared/:linkId', viewDoc);
userRouter.put('/shared/:linkId', updateDoc);

userRouter.get('/:User_id/files', getFiles);
userRouter.get('/:User_id/docs', getDocs);
userRouter.put('/:User_id/star', toggleStarred);
userRouter.put('/:User_id/files/:File_id', renameFile);
userRouter.delete('/:User_id/files/:File_id', deleteFile);

userRouter.get('/:User_id/groups', getGroups);
export default userRouter;