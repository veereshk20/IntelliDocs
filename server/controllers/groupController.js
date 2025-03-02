import { Groups } from '../models/GroupModel.js';
//import { Users } from '../models/UserModel.js';

export const getGroups = async (req, res) => {
    
    try {
            const {User_id} = req.params;
            const Group = await Groups.findOne({User_id});
            if (!Group) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json({ message: "Groups fetched successfully", Group });
        }
        catch (err) {
            console.log(err);
            return res.status(500).json({
                message: err.message,
            });
        }
}