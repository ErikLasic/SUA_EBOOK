const axios = require("axios");
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:5001/api";

async function verifyJwt(authorizationHeader) {
  if (process.env.DISABLE_AUTH === "true") {
    return { valid: true, sub: "test-user-id", role: "user" };
  }
  const res = await axios.get(`${USER_SERVICE_URL}/auth/verify`, {
    headers: { Authorization: authorizationHeader }
  });
  return res.data; // { valid, sub, email, role, ... }
}

module.exports = { verifyJwt };
