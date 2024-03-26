import mongoose from "mongoose";
import express from "express";
import Author from "../models/Author.js"
import { verifyToken } from "../auth.js";

const authorRoute = express.Router();

authorRoute.get('/', async (req, res) => {
    try {
        const authors = await Author.find({});
        res.status(200).json({ authors: authors });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

authorRoute.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const author = await Author.findById(id);
        if (author != null) {
            return res.status(200).json({ author: author });
        } else {
            return res.status(404).json({ message: "Author not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

authorRoute.post('/add', verifyToken, async (req, res) => {
    try {
        const newAuthor = new Author({
            fullName: req.body.fullName,
            age: req.body.age,
            email: req.body.email,
            address: req.body.address,
            about: req.body.about
        });

        await newAuthor.save();
        res.status(200).json({ message: "New author added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

authorRoute.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid id_ for this author" });
        }
        const author = await Author.findById(id);

        author.fullName = req.body.fullName;
        author.age = req.body.age;
        author.email = req.body.email;
        author.address = req.body.address;
        author.about = req.body.about;
        await author.save();
        return res.status(200).json({ author });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
export default authorRoute;