import express from 'express';
import mongoose from 'mongoose';

const PORT = 8080;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/library')
    .then(() => console.log("Database connected"))
    .catch(err => console.log(err));

// Define Author Schema
const authorSchema = new mongoose.Schema({
    name: String,
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }]
});
// AuthorModel
const AuthorModel = mongoose.model("Author", authorSchema);

// Define Book Schema
const bookSchema = new mongoose.Schema({
    title: String,
    author: [{ type: mongoose.Schema.Types.ObjectId, ref: "Author" }]
});

const BookModel = mongoose.model("Book", bookSchema);

// Get all authors
app.get("/api/authors", async (req, res) => {
    try {
        const authors = await AuthorModel.find().populate("books");
        res.json(authors)
    } catch (error) {
        res.status(500).json({ message: "Error fetching authors", error: error.message })
    }
});


// Get all books
app.get("/api/books", async (req, res) => {
    try {
        const books = await BookModel.find().populate("author");
        res.json(books)
    } catch (error) {
        res.status(500).json({ message: "Error fetching books", error: error.message })
    }
})


// Create author
app.post("/api/authors", async (req, res) => {
    try {
        const { name } = req.body;
        const author = new AuthorModel({ name });
        await author.save();
        res.json(author);
    } catch (error) {
        res.status(500).json({ message: "Error creating author", error: error.message });
    }
});

// Create book
app.post("/api/books", async (req, res) => {
    try {
        const { title, authorId } = req.body;
        const book = new BookModel({ title, author: authorId });
        await book.save();
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: "Error creating book", error: error.message });
    }
});

// Link books to author
app.put("/api/authors/:id/books", async (req, res) => {
    try {
        const authorId = req.params.id;
        const { bookIds } = req.body;

        const author = await AuthorModel.findById(authorId);

        if (!author) {
            return res.status(404).json({ message: "Author not found" });
        }

        author.books = bookIds;
        await author.save();

        res.json({ message: "Books linked to author successfully", author });
    } catch (error) {
        res.status(500).json({ message: "Error linking books to author", error: error.message });
    }
});

// Get author by ID
app.get("/api/authors/:id", async (req, res) => {
    try {
        const author = await AuthorModel.findById(req.params.id).populate("books");
        res.json(author);
    } catch (error) {
        res.status(500).json({ message: "Error fetching author", error: error.message });
    }
});

// Get book by ID
app.get("/api/books/:id", async (req, res) => {
    try {
        const book = await BookModel.findById(req.params.id).populate("author");
        res.json(book);
    } catch (error) {
        res.status(500).json({ message: "Error fetching book", error: error.message });
    }
});

// Delete author by ID
app.delete("/api/authors/:id", async (req, res) => {
    try {
        await AuthorModel.findByIdAndDelete(req.params.id);
        res.json({ message: "Author deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting author", error: error.message });
    }
});

// Delete book by ID
app.delete("/api/books/:id", async (req, res) => {
    try {
        await BookModel.findByIdAndDelete(req.params.id);
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting book", error: error.message });
    }
});

// Update author
app.put("/api/authors/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        const updatedAuthor = await AuthorModel.findByIdAndUpdate(
            id,
            { name },
            { new: true }
        );

        if (!updatedAuthor) {
            return res.status(404).json({ message: "Author not found" });
        }

        res.json(updatedAuthor);
    } catch (error) {
        res.status(500).json({ message: "Error updating author", error: error.message });
    }
});

// Update book
app.put("/api/books/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        const updatedBook = await BookModel.findByIdAndUpdate(
            id,
            { title },
            { new: true } 
        );

        if (!updatedBook) {
            return res.status(404).json({ message: "Book not found" });
        }

        res.json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: "Error updating book", error: error.message });
    }
});


// app.post('/api/insert-data', async (req, res) => {
//     try {
//         // Insert Authors
//         const author1 = await AuthorModel.create({ name: "Author 1" });
//         const author2 = await AuthorModel.create({ name: "Author 2" });

//         // Insert Books
//         const book1 = await BookModel.create({ title: "Book 1", author: author1._id });
//         const book2 = await BookModel.create({ title: "Book 2", author: author1._id });
//         const book3 = await BookModel.create({ title: "Book 3", author: author2._id });

//         // Update author's Book
//         author1.books.push(book1._id,book2._id);
//         author2.books.push(book3._id);
//         await author1.save();
//         await author2.save();

//         res.status(200).send({message:"Data will Inserted"})
//     } catch (error) {
//         res.status(500).json({ message: "Error Data will not inserted", error: error.message });
//     }
// })



// Server Listen
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
})
