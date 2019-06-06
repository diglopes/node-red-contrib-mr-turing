const http = require("../services/http");

module.exports = keys => {
  return http
    .post("/token-service", keys, {
      headers: {
        contentType: "application-json"
      }
    })
    .then(res => res.data);
};
