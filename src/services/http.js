const axios = require("axios");

const http = axios.create({
  baseURL: "http://qa.misterturing.com/rest"
});

module.exports = http;
