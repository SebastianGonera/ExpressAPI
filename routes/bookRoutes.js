import mongoose from "mongoose";
import express from "express";
import Book from "../models/Book.js";
import { verifyToken } from "../auth.js";

const bookRoute = express.Router();

bookRoute.get('/', async (req, res) => {
    try {
        const books = await Book.find({});
        res.status(200).json({ books: books });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

bookRoute.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const book = await Book.findById(id);
        if (book != null) {
            return res.status(200).json({ book: book });
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

bookRoute.post('/add', verifyToken, async (req, res) => {
    try {
        const newBook = new Book({
            title: req.body.title,
            isbn: req.body.isbn,
            pages: req.body.pages,
            authors: req.body.authors,
            categories: req.body.categories,
            description: req.body.description,
            published: req.body.published,
            cover: req.body.cover
        });

        await newBook.save();

        res.status(200).json({ message: "Book created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

bookRoute.put('/update/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid id_ for this book" });
        }
        const book = await Book.findById(id);
        book.title = req.body.title || book.title;
        book.isbn = req.body.isbn || book.isbn;
        book.pages = req.body.pages || book.pages;
        book.authors = req.body.authors || book.authors;
        book.categories = req.body.categories || book.categories;
        book.description = req.body.description || book.description;
        book.published = req.body.published || book.published;
        book.cover = req.body.cover || book.cover;

        await book.save();
        return res.status(200).json({ book });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default bookRoute;