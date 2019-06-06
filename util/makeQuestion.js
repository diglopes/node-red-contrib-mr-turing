const http = require("../services/http");

module.exports = (question, bot_id, token) => {
  return http.post(
    "/chat",
    {
      question,
      bot_id
    },
    {
      headers: {
        contentType: "application-json",
        authorization: `Bearer ${token}`
      }
    }
  );
};
