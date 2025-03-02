import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {

    mongoose.connection.on('connected', () => {
        console.log('Mongoose is connected');
    });
    try {
        await mongoose.connect(`${process.env.MONGO_URL}`);
    }
    catch (err) {
        console.error('Error at db.js', err);
    }

};

export default connectDB;