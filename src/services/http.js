const axios = require("axios");

const http = axios.create({
  baseURL: "https://app.misterturing.com/rest"
});

module.exports = http;
