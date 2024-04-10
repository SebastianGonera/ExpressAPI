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
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
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
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

authorRoute.post('/add', verifyToken, async (req, res) => {
    try {
        const author = await Author.findOne({
            'fullName': req.body.fullName,
            'email': req.body.email
        });
        if (author) {
            return res.status(400).json({ message: "Author with this data exists in database" });
        }
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
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

authorRoute.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid id_ for this author" });
        }
        const author = await Author.findById(id);
        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }
        author.fullName = req.body.fullName;
        author.age = req.body.age;
        author.email = req.body.email;
        author.address = req.body.address;
        author.about = req.body.about;
        await author.save();
        return res.status(200).json({ author });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
export default authorRoute;