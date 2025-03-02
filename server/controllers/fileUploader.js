import cloudinary from "../utils/cloudinary.js";
import { Users } from "../models/UserModel.js";
import { Documents } from "../models/DocumentModel.js";
import { File } from "../models/FileModel.js";
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, unlinkSync } from 'fs';
import { LastSeen } from "../models/LastSeenModel.js";
import axios from 'axios';
import { Groups } from "../models/GroupModel.js";


export const fileUploader = async (req, res) => {

    try {
        let responses=[]
        //const { file } = req.file;
        // console.log("BO", req.body);
        // console.log("File",req.file);
        
        const { email } = req.body;

        console.log(email)
        //console.log("request",req.files)

        // if (!req.file) {
        //     return res.status(400).json({
        //         message: "No file uploaded",
        //     });
        // }
        //console.log("iam here")
        let array=req.files
        //console.log("array",array);
        const User = await Users.findOne({email});
        console.log("User ", User);
        const User_id = User.User_id;
        const User_id123=User.User_id
        console.log("userIDdn ",User_id)
        // console.log(User_id);

        // console.log(req.file)
        const processFilePromises=array.map(async (element,index)=>{
            // console.log("element",element)
            const ext = element.originalname.split(".").pop();
            if (ext === 'docx') {
                const docBuffer = readFileSync(element.path);
                const result = await mammoth.extractRawText({ buffer: docBuffer });
                const deltaContent = {
                    ops: [
                        { insert: result.value + '\n' }
                    ]
                }
                const newDoc = new Documents({
                    Document_id: uuidv4(),
                    content: deltaContent,
                    document_name: element.originalname,
                    owner: User_id,
                })
                await newDoc.save();
                const flaskResponse = await axios.post('http://127.0.0.1:5000/process',{
                    'Docx' : newDoc,
                    'ext': 'docx'
                })
                newDoc.DocumentBrief={response_json:flaskResponse.docs}
                await newDoc.save()

                const user = await Users.findOne({  User_id });
                user.Document_id.push(newDoc.Document_id);
                await user.save();

                const lastSeen = await new LastSeen({
                    User_id,
                    Document_id: newDoc.Document_id,
                    permission: 'owner',
                    LastSeen: Date.now(),
                });

                await lastSeen.save();
    
            }
            else
            {
                    // console.log(req.file.originalname);
            const filename = element.originalname.split('.').slice(0, -1).join('.');
            let fileUrl = await cloudinary.uploader.upload(element.path, { resource_type: 'auto' });
            let File_id = uuidv4()
            const fileUpload = await new File({
                File_id: File_id,
                content: fileUrl.secure_url,
                owner: User_id,
                type: ext,
                filename: filename,

            });
            await fileUpload.save();
            const flaskResponse = await axios.post('http://127.0.0.1:5000/process',{
                "File_id" : File_id,
                "url" : fileUrl,
                'ext':'pdf'
            })
            
            // console.log("fileupload",fileUpload)

            // console.log("fileupload breif",fileUpload.FileBrief)
            //console.log(flaskResponse.data.files)
            // let obj={
            //     File_Id:flaskResponse.data.files.File_id,
            //     response_json:flaskResponse.data.files.response_data_json_content}
            // console.log("processed files mmm ",flaskResponse.data.files);
            //console.log("reponse_json ",)
            fileUpload.FileBrief = { response_json: flaskResponse.data.files[0].response_data_json_content };
            await fileUpload.save();

            // console.log("file upload",fileUpload)
            const user = await Users.findOne({  User_id });
        // console.log("UUU   ", user);

            await user.File_id.push(fileUpload.File_id);
            await user.save();
            const lastSeen = await new LastSeen({
                User_id,
                File_id: fileUpload.File_id,
                permission: 'owner',
                LastSeen: Date.now(),
            });


            
            console.log("success")
            
            }
            

        })
        console.log("User_id before  ",User_id123)
        await Promise.all(processFilePromises);
        const GroupResponse = await axios.get('http://127.0.0.1:5000/group')
        console.log("GroupResponse",GroupResponse.data);
        for (let key in GroupResponse.data.Groups) {
            responses.push({ [key]: GroupResponse.data.Groups[key] });
        }
        
        const newGroupsData = {
            'User_id':User_id123,
            'Medical Bills': ['file1.pdf', 'file2.pdf'],
            'Pathology Reports': ['file3.pdf']
          };
          
          const updatedGroup = await Groups.findOneAndUpdate(
            { User_id: User_id }, // Find the document where User_id matches
            { 
                $set: { 
                    Groups: responses, // Update the Groups field
                    User_id: User_id   // Ensure User_id is present in the document
                }  
            },
            { new: true, upsert: true } // Return updated doc, create if not found
        );
        
          
          console.log("Updated Group Document:", updatedGroup);
          
        // const Group=new GroupSchema()
        return res.status(200).json({
            responses:responses,
            message:"files processed successfully"
        })
    }
        catch (err) {
            console.log(err);
            return res.status(500).json({
                message: "Error occured while uploading file",
            });
        }
        
        

        
        

        

        

        
        

        

        
        
    

};

export const renameFile = async (req, res) => {

    try {
        const { User_id, File_id } = req.params;
        const { newFilename } = req.body;

        const file = await File.findOne({ File_id });
        if (!file) {
            return res.status(404).json({
                message: "File not found",
            });
        }

        const permission = await LastSeen.findOne({ User_id, File_id });
        //console.log(permission);
        if (permission.permission !== 'owner' && permission.permission !== 'edit') {
            return res.status(403).json({
                message: "You do not have permission to rename this file",
            });
        }

        file.filename = newFilename;
        const newFile = await file.save();

        return res.status(200).json({
            message: "File renamed successfully",
            newFile,
        });


    }

    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Error occured while renaming file",
        });
    }

};

export const deleteFile = async (req, res) => {
    try {
        const { User_id, File_id } = req.params;

        const file = await File.findOne({ File_id });
        if (!file) {
            return res.status(404).json({
                message: "File not found",
            });
        }

        const permission = await LastSeen.findOne({ User_id, File_id });
        if (permission.permission !== 'owner') {
            await LastSeen.deleteOne({ User_id, File_id });
            return res.status(200).json({
                message: "File deleted successfully",
            });
        }

        await LastSeen.deleteMany({ File_id });
        await File.deleteOne({ File_id });
        return res.status(200).json({
            message: "File deleted successfully",
        });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "Error occured while deleting file",
        });
    }
};