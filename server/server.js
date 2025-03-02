import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './db.js';
import userRouter from './routes/user.js';
import fileRouter from './routes/fileRoutes.js';  // Import file routes

dotenv.config();
const app = express();

app.use(express.json());  
app.use(express.urlencoded({ extended: true }));
const port = process.env.PORT || 8080;
connectDB();

app.use(cors({ origin: "*" }));

app.get('/', (req, res) => {
    res.send('Welcome to IntelliDocs');
});

app.use('/api/auth', userRouter);
app.use('/api/files', fileRouter);  // Use file conversion routes



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
