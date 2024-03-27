import express from "express";
import bcrypt from "bcrypt";
import Author from "../models/Author.js";
import Book from "../models/Book.js";
import User from "../models/User.js";
import { generateToken, verifyToken } from "../auth.js";

const userRoute = express.Router();

const salt = 12;

userRoute.get('/favorite_books/:userId', verifyToken, async (req, res) => {
    try {
        const id = req.params.userId;
        const userBooks = await User.findOne({ '_id': id }, 'favoriteBooks');
        if (!userBooks) {
            return res.status(400).json({ message: "User not found" });
        }

        const books = [];
        for (const idBook in userBooks.favoriteBooks) {
            let book = await Book.findById(userBooks.favoriteBooks[idBook]);
            if (book) {
                books.push(book);
            }
        }
        res.status(200).json({ books: books });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

userRoute.get('/favorite_authors/:userId', verifyToken, async (req, res) => {
    try {
        const id = req.params.userId;
        const user = await User.findOne({ '_id': id }, 'favoriteAuthors');

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const authors = [];
        for (const idAuthor in user.favoriteAuthors) {
            let author = await Author.findById(user.favoriteAuthors[idAuthor]);
            if (author) {
                authors.push(author);
            }
        }
        res.status(200).json({ authors: authors });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

userRoute.post('/signup', async (req, res) => {
    try {
        const email = await User.findOne({ 'email': req.body.email }, 'email');

        if (email) {
            return res.status(400).json({ message: "User with this e-mail exists in database" });
        }
        else {
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, salt)
            });

            await newUser.save();

            res.status(200).json({ message: "User created successfully" });

        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

userRoute.post('/signin', async (req, res) => {
    try {
        const user = await User.findOne({ 'email': req.body.email });

        if (!user) {
            return res.status(400).json({ message: "Not found user with this email" });
        }
        else {
            const pass = req.body.password;
            const passwordMatch = bcrypt.compareSync(pass, user.password);

            if (!passwordMatch) {
                return res.status(400).json({ message: "Wrong password" });
            }
            else {
                const token = generateToken(user);
                res.status(200).json({ token: token, user: user });
            }
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

userRoute.put('/add_favorite_book/:bookId', verifyToken, async (req, res) => {
    try {
        const userId = req.body.userId;
        const bookId = req.params.bookId;

        const book = await Book.findById(bookId);
        const user = await User.findById(userId);

        if (!book) {
            return res.status(400).json({ message: "Book with this id not found" });
        }

        if (!user) {
            return res.status(400).json({ message: "User with this id not found" });
        }

        user.favoriteBooks.push(bookId);
        await user.save();

        res.status(200).json({ message: "Book added to favorite successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

userRoute.put('/add_favorite_author/:authorId', verifyToken, async (req, res) => {
    try {
        const userId = req.body.userId;
        const authorId = req.params.authorId;

        const author = await Author.findById(authorId);
        const user = await User.findById(userId);

        if (!author) {
            return res.status(400).json({ message: "Author with this id not found" });
        }

        if (!user) {
            return res.status(400).json({ message: "User with this id not found" });
        }

        user.favoriteAuthors.push(authorId);
        await user.save();

        res.status(200).json({ message: "Author added to favorite successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

userRoute.put('/update/:userId', verifyToken, async (req, res) => {
    try {
        const id = req.params.userId;
        const user = await User.findById(id);

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email;

        await user.save();
        const token = generateToken(user);

        res.status(200).json({ message: "User successfully updated", token: token });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});

userRoute.put("/change_password/:id", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return  res.status(400).json({ message: "User not found" });
        }
        if(req.body.password && req.body.confirmPass
            && req.body.password == req.body.confirmPass){
                const newPass = bcrypt.hashSync(req.body.password, salt);

                user.password = newPass;
        
                await user.save();
        
                return  res.status(200).json({ message: "Password successfully changed for user" });
            }
        else{
            return res.status(400).json({message:"Password and second password are not the same"});
        }
       
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

userRoute.delete('/remove_favorite_book/:bookId', verifyToken, async (req, res) => {
    try {
        const userId = req.body.userId;
        const bookId = req.params.bookId;

        const book = await Book.findById(bookId);
        const user = await User.findById(userId);

        if (!book) {
            return res.status(400).json({ message: "Book with this id not found" });
        }

        if (!user) {
            return res.status(400).json({ message: "User with this id not found" });
        }

        user.favoriteBooks = user.favoriteBooks.filter(id => id != bookId);
        await user.save();

        res.status(200).json({ message: "Book deleted from favorite successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

});

userRoute.delete('/remove_favorite_author/:authorId', verifyToken, async (req, res) => {
    try {
        const userId = req.body.userId;
        const authorId = req.params.authorId;

        const author = await Author.findById(authorId);
        const user = await User.findById(userId);

        if (!author) {
            return res.status(400).json({ message: "Author with this id not found" });
        }

        if (!user) {
            return res.status(400).json({ message: "User with this id not found" });
        }

        user.favoriteAuthors = user.favoriteAuthors.filter(id => id != authorId);
        await user.save();

        res.status(200).json({ message: "Author deleted from favorite successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

userRoute.delete('/delete/:userId', verifyToken, async (req, res) => {
    try {
        const id = req.params.userId;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User successfully deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default userRoute;
