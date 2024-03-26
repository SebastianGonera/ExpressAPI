import mongoose from "mongoose";

const AuthorSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        age: { type: Number, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        about: { type: String, required: false }
    },
);

const Author = mongoose.model("Author", AuthorSchema);

export default Author;
