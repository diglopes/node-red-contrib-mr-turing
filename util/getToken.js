const http = require("../services/http");

module.exports = (client_id, client_secret, user, password) => {
  return http
    .post(
      "/token-service",
      {
        client_id,
        client_secret,
        user,
        password
      },
      {
        headers: {
          contentType: "application-json"
        }
      }
    )
    .then(res => res.data);
};
