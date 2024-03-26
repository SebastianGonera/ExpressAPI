import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    isbn: { type: String, required: true },
    pages: { type: Number, required: true },
    authors: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Author",
    }],
    categories: { type: String, required: true },
    description: { type: String, required: true },
    published: { type: String, required: true },
    cover: {type: String, required: false},
  });

const Book = mongoose.model("Book", BookSchema);

export default Book;
  