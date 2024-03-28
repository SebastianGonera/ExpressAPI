import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import Author from "../models/Author.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import { isAdmin, verifyToken } from "../auth.js";

const adminRoute = express.Router();
const salt = 12;

adminRoute.get('/users', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await User.find({});
        if (!users) {
            return res.status(404).json({ message: "Database is empty" });
        }
        res.status(200).json({ users: users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

adminRoute.get('/books', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await Book.find({});
        if (!users) {
            return  res.status(404).json({ message: "Database is empty" });
        }
        res.status(200).json({ books: users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

adminRoute.get('/authors', verifyToken, isAdmin, async (req, res) => {
    try {
        const users = await Author.find({});
        if (!users) {
            return  res.status(404).json({ message: "Database is empty" });
        }
        res.status(200).json({ authors: users });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

adminRoute.post('/add_user', verifyToken, isAdmin, async (req, res) => {
    try {
        const email = await User.findOne({ 'email': req.body.email }, 'email');
        if (email) {
            return res.status(404).json({ message: "User with this e-mail exists in database" });
        }
        else{
            const pass = bcrypt.hashSync(req.body.password, salt);
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: pass
            });
            await newUser.save();
    
            res.status(200).json({ message: "New user created successfully" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

adminRoute.post('/add_book', verifyToken, isAdmin, async (req, res) => {
    try {
        const isbn = await Book.findOne({'isbn': req.body.isbn});
        if(isbn){
            return res.status(404).json({message : "Book with this isbn exists in database"});
        }
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

adminRoute.post('/add_author', verifyToken, isAdmin, async (req, res) => {
    try {
        const author = await Author.findOne({'fullName': req.body.fullName,
         'email': req.body.email});
        if(author){
            return res.status(400).json({message: "Author with this data exists in database"});
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
        res.status(500).json({ message: error.message });
    }
});

adminRoute.put('/add_admin/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return  res.status(404).json({ message: "User not found" });
        }
        user.isAdmin = true;
        await user.save();

        res.status(200).json({ message: "Added new administrator" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

adminRoute.put('/remove_admin/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
           return res.status(404).json({ message: "User not found" });
        }
        if (!user.isAdmin) {
            return res.status(400).json({ message: "This user is not admin" });
        }
        user.isAdmin = false;
        await user.save();

        res.status(200).json({ message: "User is deleted as admin" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

adminRoute.put('/update_book/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid id_ for this book" });
        }
        const book = await Book.findById(id);
        if(!book){
            return res.status(404).json({message: "Book not found"});
        }
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

adminRoute.put('/update_author/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid id_ for this author" });
        }

        const author = await Author.findById(id);
        if(!author){
            return res.status(404).json({message: "Author not found"});
        }
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

adminRoute.put("/change_password/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return  res.status(404).json({ message: "User not found" });
        }
        const newPass = bcrypt.hashSync(req.body.password, salt);

        user.password = newPass;

        await user.save();

        res.status(200).json({ message: "Password successfully changed for user" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

adminRoute.put('/update_user/:userId', verifyToken, isAdmin, async (req, res) => {
    try {
        const id = req.params.userId;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;
        user.favoriteBooks = req.body.favoriteBooks || user.favoriteBooks;
        user.favoriteAuthors = req.body.favoriteAuthors || user.favoriteAuthors;

        await user.save();
        res.status(200).json({ message: "User successfully updated" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

adminRoute.delete('/delete_book/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        let book = await Book.findByIdAndDelete(id);
        if (book) {
            return res.status(200).json({ message: 'Successfully deleted book' });
        } else {
            return  res.status(404).json({ message: "Book not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

adminRoute.delete('/delete_author/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        let author = await Author.findByIdAndDelete(id);
        if (author) {
            return res.status(200).json({ message: 'Successfully deleted author' });
        } else {
            return res.status(404).json({ message: "Author not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

adminRoute.delete('/delete_user/:userId', verifyToken, async (req, res) => {
    try {
        const id = req.params.userId;
        const userIsAdmin = await User.findById(id);
        if(userIsAdmin.isAdmin){
            return res.status(400).json({message:"This user is admin"});
        }
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return  res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User successfully deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default adminRoute;