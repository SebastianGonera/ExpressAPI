import express from "express";
import { verifyToken } from "../auth.js";
import multer from "multer";
import {v2 as cloudinary} from "cloudinary";
import streamifier from "streamifier";
import * as dotenv from "dotenv";

const uploadRouter = express.Router();
dotenv.config({
    path: '../.env'
});

const upload = multer();
uploadRouter.post(
    '/',
    verifyToken,
    upload.single('file'),
    async (req, res) => {
        try {
            cloudinary.config({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET
            });
            const uploadStream = (req) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream((err, result) => {
                        if (result) resolve(result);
                        else reject(err);
                    });
                    streamifier.createReadStream(req.file.buffer).pipe(stream);
                });
            };
            const resultUpload = await uploadStream(req);

            res.json({ secure_url: resultUpload.secure_url,
                url: resultUpload.url,
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
});

export default uploadRouter;