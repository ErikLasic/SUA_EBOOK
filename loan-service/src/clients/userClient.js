const axios = require("axios");
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:5001/api";

async function verifyJwt(authorizationHeader) {
  if (process.env.DISABLE_AUTH === "true") {
    // za lokalni dev lahko simuliramo admina
    return { valid: true, sub: "dev-user", role: "admin", name: "Dev Admin" };
  }
  const res = await axios.get(`${USER_SERVICE_URL}/auth/verify`, {
    headers: { Authorization: authorizationHeader }
  });
  return res.data;
}

module.exports = { verifyJwt };
