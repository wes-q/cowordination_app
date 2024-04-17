require("dotenv").config();

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;

module.exports = {
    FRONTEND_URL,
    PORT,
};
