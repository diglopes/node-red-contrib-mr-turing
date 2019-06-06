const http = require("../services/http");

module.exports = token => {
  return http
    .get("/bot", {
      headers: {
        contentType: "application-json",
        authorization: `Bearer ${token}`
      }
    })
    .then(res => res.data);
};
