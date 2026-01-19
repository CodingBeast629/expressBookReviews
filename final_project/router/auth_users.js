const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");

const regd_users = express.Router();

let users = [];

// returns boolean: true if username is NOT already taken
const isValid = (username) => {
  return !users.some((u) => u.username === username);
};

// returns boolean: true if username + password match a stored user
const authenticatedUser = (username, password) => {
  return users.some((u) => u.username === username && u.password === password);
};

/**
 * Task 7:
 * Login as a registered user
 * Endpoint must be: /customer/login (router likely mounted at /customer in index.js)
 */
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid login. Check username and password" });
  }

  // Create JWT token and store user creds in session
  const accessToken = jwt.sign(
    { username },
    "access",
    { expiresIn: "1h" }
  );

  req.session.authorization = { accessToken, username };

  return res.status(200).json({
    message: "User successfully logged in",
    token: accessToken,
  });
});

/**
 * Task 8:
 * Add or modify a book review
 * Hint: review must come as a request query param (?review=...)
 * and must be posted with the username stored in session.
 */
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  const username = req.session?.authorization?.username;
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!review) {
    return res.status(400).json({ message: "Review query parameter is required (e.g., ?review=Great)" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  // Add/overwrite this user's review for this ISBN
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews,
  });
});

/**
 * Task 9:
 * Delete a book review (only your own)
 * Hint: Filter & delete based on session username.
 */
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  const username = req.session?.authorization?.username;
  if (!username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review by this user for this book" });
  }

  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
