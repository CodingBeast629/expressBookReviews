const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

/**
 * Register a new user
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // isValid should return TRUE when username already exists (common lab behavior)
  if (isValid(username)) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

/**
 * Task 10:
 * Get the list of books using Promises / async patterns (NO axios self-calls)
 */
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await Promise.resolve(books);
    return res.status(200).json(allBooks);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books", error: err.message });
  }
});

/**
 * Task 11:
 * Get book details based on ISBN using async/await
 */
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    const isbn = req.params.isbn;

    const book = await Promise.resolve(books[isbn]);
    if (!book) return res.status(404).json({ message: "Book not found" });

    return res.status(200).json(book);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching book by ISBN", error: err.message });
  }
});

/**
 * Task 12:
 * Get book details based on author using Promises
 */
public_users.get("/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();

  Promise.resolve()
    .then(() => {
      const results = Object.keys(books)
        .filter((isbn) => books[isbn].author.toLowerCase() === author)
        .map((isbn) => books[isbn]);

      return results;
    })
    .then((results) => res.status(200).json(results))
    .catch((err) => res.status(500).json({ message: "Error fetching books by author", error: err.message }));
});

/**
 * Task 13:
 * Get book details based on title using async/await
 */
public_users.get("/title/:title", async (req, res) => {
  try {
    const title = req.params.title.toLowerCase();

    const results = await Promise.resolve(
      Object.keys(books)
        .filter((isbn) => books[isbn].title.toLowerCase() === title)
        .map((isbn) => books[isbn])
    );

    return res.status(200).json(results);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books by title", error: err.message });
  }
});

/**
 * Get book reviews
 */
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
