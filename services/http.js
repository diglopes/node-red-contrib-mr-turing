const axios = require("axios");

const http = axios.create({
  baseUrl: "https://qa.misterturing.com"
});

module.exports = http;
