const axios = require("axios");
const BASE = process.env.BOOK_SERVICE_URL || "http://localhost:8000";
// Book service ima prefix "/books" (FastAPI include_router(prefix="/books"))

async function fetchBook(bookId) {
  const res = await axios.get(`${BASE}/books/${bookId}`);
  return res.data; // { id, title, author, ... , state }
}

async function updateBookState(bookId, state) {
  // FastAPI endpoint: PUT /books/{id}/state?state=unharmed|damaged
  const res = await axios.put(`${BASE}/books/${bookId}/state`, null, { params: { state } });
  return res.data;
}

module.exports = { fetchBook, updateBookState };
