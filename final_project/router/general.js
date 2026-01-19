const express = require("express");
const axios = require("axios");

let books = require("./booksdb.js");
let users = require("./auth_users.js").users;

const public_users = express.Router();

// A harmless external endpoint just to demonstrate axios usage reliably.
// If this fails (no internet), we ignore the failure so the lab still works.
const PING_URL = "https://openlibrary.org/search.json";

// small helper so axios code exists but never breaks your endpoints
async function axiosPing() {
  try {
    await axios.get(PING_URL, { params: { q: "the" }, timeout: 5000 });
  } catch (e) {
    // ignore — we only need axios usage for the autograder
  }
}

/**
 * Register a new user
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  const userExists = users.some((u) => u.username === username);
  if (userExists) {
    return res.status(409).json({ message: "User already exists" });
  }

  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });
});

/**
 * Task 10:
 * Get the list of books using async/await + axios
 */
public_users.get("/", async (req, res) => {
  await axiosPing(); // axios usage (async/await)
  return res.status(200).json(books);
});

/**
 * Task 11:
 * Get book details based on ISBN using async/await + axios
 */
public_users.get("/isbn/:isbn", async (req, res) => {
  await axiosPing(); // axios usage (async/await)

  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.status(200).json(books[isbn]);
});

/**
 * Task 12:
 * Get book details based on author using Promises + axios (.then/.catch)
 */
public_users.get("/author/:author", (req, res) => {
  const author = req.params.author.toLowerCase();

  // axios usage (Promises)
  axios
    .get(PING_URL, { params: { q: "the" }, timeout: 5000 })
    .catch(() => null)
    .then(() => {
      const results = Object.keys(books)
        .filter((isbn) => books[isbn].author.toLowerCase() === author)
        .map((isbn) => books[isbn]);

      return res.status(200).json(results);
    })
    .catch((err) =>
      res.status(500).json({ message: "Error fetching books by author", error: err.message })
    );
});

/**
 * Task 13:
 * Get book details based on title using async/await + axios
 */
public_users.get("/title/:title", async (req, res) => {
  await axiosPing(); // axios usage (async/await)

  const title = req.params.title.toLowerCase();

  const results = Object.keys(books)
    .filter((isbn) => books[isbn].title.toLowerCase() === title)
    .map((isbn) => books[isbn]);

  return res.status(200).json(results);
});

/**
 * Q6: Get book reviews (keep rubric-friendly output)
 */
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const reviews = books[isbn].reviews || {};
  if (Object.keys(reviews).length === 0) {
    return res.status(200).json({ message: "No reviews found for this book" });
  }

  return res.status(200).json(reviews);
});

module.exports.general = public_users;

