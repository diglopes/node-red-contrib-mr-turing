const axios = require("axios");

const http = axios.create({
  baseURL: "https://qa.misterturing.com/rest"
});

module.exports = http;
