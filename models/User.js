import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        username: { type: String, required: true },
        email: { type: String, required: true },
        password: { type: String, required: true },
        favoriteBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
        favoriteAuthors: [{ type: mongoose.Schema.Types.ObjectId, ref: "Author" }],
        isAdmin: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

export default User;
