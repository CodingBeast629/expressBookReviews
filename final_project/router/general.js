const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Base URL for calling our own server endpoints
const BASE_URL = "http://localhost:5000";

/**
 * Register a new user  (keep as-is, not part of Tasks 10–13)
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // isValid === username is AVAILABLE
  if (!isValid(username)) {
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
  try {
    // Call our own internal endpoint that returns all books
    const response = await axios.get(`${BASE_URL}/`);
    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching books", error: err.message });
  }
});

/**
 * Task 11:
 * Get book details based on ISBN using async/await + axios
 */
public_users.get("/isbn/:isbn", async (req, res) => {
  const isbn = req.params.isbn;

  try {
    // Call our own endpoint that returns a book by ISBN
    const response = await axios.get(`${BASE_URL}/isbn/${isbn}`);
    return res.status(200).json(response.data);
  } catch (err) {
    // If the internal endpoint returns 404, forward it nicely
    const status = err.response?.status || 500;
    const data = err.response?.data || { message: "Error fetching book by ISBN", error: err.message };
    return res.status(status).json(data);
  }
});

/**
 * Task 12:
 * Get book details based on author using async/await + axios
 */
public_users.get("/author/:author", async (req, res) => {
  const author = req.params.author;

  try {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return res.status(200).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || { message: "Error fetching books by author", error: err.message };
    return res.status(status).json(data);
  }
});

/**
 * Task 13:
 * Get book details based on title using async/await + axios
 */
public_users.get("/title/:title", async (req, res) => {
  const title = req.params.title;

  try {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return res.status(200).json(response.data);
  } catch (err) {
    const status = err.response?.status || 500;
    const data = err.response?.data || { message: "Error fetching books by title", error: err.message };
    return res.status(status).json(data);
  }
});

/**
 * Get book reviews (leave as synchronous; not part of Tasks 10–13)
 */
public_users.get("/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
