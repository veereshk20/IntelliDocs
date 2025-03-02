import jwt from 'jsonwebtoken';
import { Users } from '../models/UserModel.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { File } from '../models/FileModel.js';
import { LastSeen } from '../models/LastSeenModel.js';
import { Documents as Document } from '../models/DocumentModel.js';
// Sign a token for a logged in user
const regToken = (id) => {

    return jwt.sign({ id }, process.env.JWT_SECRET);

};

export const getUser = async (req, res) => {
    const {user_name} = req.query;
    console.log(user_name);
    const user = await Users.findOne({user_name});
    if(!user){
        return res.status(203).json({
            message:"No such use exists"
        })
    }

    console.log(user)
    const user_id = user.User_id;
    return res.status(200).json({
        message: "User returned successfully",
        user_id: user_id,
    });
}


// // Login is based on user_name and password
// export const loginUser = async (req, res) => {

//     try {
//         const { user_name, password } = req.body;

//         // Check if the user_name is valid
//         const existingUser = await Users.findOne({ user_name });
        // const validPass = await bcrypt.compare(password, existingUser.password);
        // if (!validPass) {
        //     return res.status(400).json({
        //         message: 'Invalid password',
        //     });
        // }

//         if (!validPass) {
//             return res.status(400).json({
//                 message: 'Invalid password',
//             });
//         }

//         // Sign a token for the user
//         const token = regToken(existingUser._id);

//         return res.status(200).json({
//             message: 'User logged in successfully',
//             token,

//         });

//     }
//     catch (err) {
//         console.log(err);
//         return res.status(500).json({
//             message: err.message,
//         });
//     }

// };


export const regUser = async (req, res) => {
    try {
        console.log("Inside regUsre");
        const { email, password, user_name } = req.body;

        console.log(req.body);

        // Check if the user_name is valid
        const user_nameExists = await Users.findOne({ user_name });
        //console.log(user_nameExists);
        if (user_nameExists) {
            return res.status(400).json({
                message: 'User name already exists',
            });
        }

        // Check if the email is valid
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                message: 'Please enter a valid email',
            });
        }

        // Check if the email is already registered
        const emailExists = await Users.findOne({ email });
        //console.log(emailExists);
        if (emailExists) {
            return res.status(400).json({
                message: 'Email already exists',
            });
        }

      
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user_id = uuidv4();
        // Hash the password
        const newUser = new Users({
            User_id: user_id,
            email,
            password: "",
            user_name,
        });

        await newUser.save();

        console.log(newUser);

        const token = regToken(newUser._id);

        return res.status(200).json({
            message: 'User registered successfully',
            token,
        });

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: err.message,
        });
    }
};

export const getFiles = async (req, res) => {
    const { User_id } = req.params;

    try {
        const user = await Users.findOne({ User_id });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const fileIds = user.File_id;
        let fileInfo = [];

        // Use `Promise.all` to wait for all async operations
        await Promise.all(
            fileIds.map(async (file_id) => {
                const file = await File.findOne({ File_id: file_id });
                if (!file) return;
                
                let fileid = file.File_id;
                let fileName = file.filename;
                let fileUrl = file.content;
                let fileType = file.type;
                let ownerRow = await Users.findOne({ User_id: file.owner });
                let owner = ownerRow.user_name;
                let breif = file.FileBrief;
                // ✅ Await the query to get collaborators
                const users = await LastSeen.find({ File_id: file_id, permission: 'edit' });
                let collaborators = users.map(user => user.user_name);

                // ✅ Await the queries for modified_at and permission
                const lastSeenEntry = await LastSeen.findOne({ File_id: file_id, User_id });
                let modified_at = lastSeenEntry ? lastSeenEntry.LastSeen : null;
                let permission = lastSeenEntry ? lastSeenEntry.permission : null;
                let starred = lastSeenEntry ? lastSeenEntry.starred : null;

                fileInfo.push({
                    fileid,
                    fileName,
                    fileUrl,
                    fileType,
                    owner,
                    breif,
                    collaborators,
                    modified_at,
                    permission,
                    starred
                });
            })
        );

        return res.status(200).json({ files: fileInfo });

    } 
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error fetching files',
        });
    }
};


export const getDocs = async (req, res) => {
    const { User_id } = req.params;

    try {
        const user = await Users.findOne({ User_id });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const fileIds = user.Document_id;
        let fileInfo = [];

        // Use `Promise.all` to wait for all async operations
        await Promise.all(
            fileIds.map(async (file_id) => {
                const file = await Document.findOne({ Document_id: file_id });
                if (!file) return;

                console.log(file);

                let fileid = file.Document_id
                let fileName = file.document_name;
                let fileUrl = file.content;
                let fileType = "docx";
                let ownerRow = await Users.findOne({ User_id: file.owner });
                let owner = ownerRow.user_name;
                let breif = file.DocumentBrief || null;
                // ✅ Await the query to get collaborators
                const users = await LastSeen.find({ Document_id: file_id, permission: 'edit' });
                let collaborators = users.map(user => user.user_name);

                // ✅ Await the queries for modified_at and permission
                const lastSeenEntry = await LastSeen.findOne({ Document_id: file_id, User_id });
                let modified_at = lastSeenEntry ? lastSeenEntry.LastSeen : null;
                let permission = lastSeenEntry ? lastSeenEntry.permission : null;
                let starred = lastSeenEntry ? lastSeenEntry.starred : null;

                fileInfo.push({
                    fileid,
                    fileName,
                    fileUrl,
                    fileType,
                    owner,
                    breif,
                    collaborators,
                    modified_at,
                    permission,
                    starred
                });
            })
        );

        return res.status(200).json({ files: fileInfo });

    } 
    catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Error fetching files',
        });
    }
};

export const toggleStarred = async (req, res) => {
    try {
        const { User_id} = req.params;
        const { File_id } = req.body;

        // Ensure either fileId or documentId is provided
        if (!File_id) {
            return res.status(400).json({ message: "Provide either fileId or documentId" });
        }

        // Find the entry in LastSeen
        const user = await LastSeen.findOne({User_id});

        if(!user){
            return res.status(400).json({
                message:"User not found",
            });
        }

        
        let lastSeenEntry = await LastSeen.findOne({User_id:User_id, Document_id: File_id});
        console.log("log1"+lastSeenEntry);
        
        if(!lastSeenEntry){
            lastSeenEntry = await LastSeen.findOne({User_id:User_id, File_id: File_id});
        }

        console.log("log2"+lastSeenEntry);


        if (!lastSeenEntry) {
            return res.status(404).json({ message: "File or Document not found in LastSeen" });
        }

        // Toggle the starred status
        lastSeenEntry.starred = !lastSeenEntry.starred;
        await lastSeenEntry.save();

        res.status(200).json({
            success: true,
            message: `Marked as ${lastSeenEntry.starred ? "starred" : "unstarred"}`,
            data: lastSeenEntry
        });

    } catch (error) {
        console.error("Error toggling starred status:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

