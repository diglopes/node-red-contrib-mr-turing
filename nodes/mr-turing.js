const axios = require("axios");
const { DateTime } = require("luxon");

module.exports = function (RED) {
  "use strict";
  function MrTuring(config) {
    RED.nodes.createNode(this, config);

    const node = this;
    node.botName = config.botName;
    node.random = config.random || false;
    node.connection = RED.nodes.getNode(config.connection);
    node.status({});

    node.on("input", async (msg, send, done) => {
      const credentials = {
        ...node.connection.credentials,
        user: node.connection.user,
      };
      const question = msg.payload.question || msg.payload.q || msg.payload;
      if (typeof question !== "string") {
        node.status({
          fill: "red",
          shape: "ring",
          text: "question not provided",
        });
        msg.error = new Error("Question was not provided");
        send(msg);
        return;
      }
      try {
        let response = null;
        try {
          node.status({ fill: "yellow", shape: "dot", text: "asking..." });
          response = await askQuestionToBot(
            question,
            credentials,
            node.botName
          );
        } catch (error) {
          httpService.tokenExpTime = null;
        }
        if (!response) {
          response = await askQuestionToBot(
            msg.payload,
            credentials,
            node.botName
          );
        }
        const { output } = response;
        const randomNumber = Math.floor(
          Math.random() * (output.length - 0) + 0
        );
        msg.payload = node.random
          ? (msg.payload = output[randomNumber])
          : output;

        node.status({});

        send(msg);
        if (done) done();
      } catch (error) {
        node.error({ Error: error.response });
        node.status({
          fill: "red",
          shape: "ring",
          text: "question not sended",
        });
        msg.error = error;
        let errorMessage = "";

        /**
         * Handle invalid bot error
         * */
        if (error.response.data.bot_id) {
          errorMessage = "O bot provido é inválido";
        }
        /**
         * Handle other errors
         * */
        if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        }

        if (done) {
          done(errorMessage);
        } else {
          node.error(errorMessage);
        }
      }
    });

    node.on("close", () => {
      httpService.tokenExpTime = null;
      httpService.botId = null;
      httpService.token = null;
    });
  }
  RED.nodes.registerType("mr-turing", MrTuring);
};

const askQuestionToBot = async (question, credentials = {}, botName) => {
  const { tokenExpTime, token } = httpService;
  const isTokenValid =
    token && tokenExpTime && validateTokenExpTime(tokenExpTime);
  if (!isTokenValid) await httpService.getToken(credentials);
  if (!httpService.botId) await httpService.getKnowledgeId(botName);
  return httpService.sendQuestion(question);
};

const validateTokenExpTime = (expirationTime) =>
  expirationTime - DateTime.local().toSeconds() > 0;

const httpService = {
  tokenExpTime: null,
  botId: null,
  token: null,
  request: axios.create({
    baseURL: "https://backend.cluster.mrturing-k8s.com/rest/",
  }),
  getToken({
    user,
    password,
    clientID: client_id,
    clientSecret: client_secret,
  }) {
    return this.request
      .post("/token-service", {
        user,
        password,
        client_id,
        client_secret,
      })
      .then(({ data }) => {
        this.token = data.access_token;
        this.tokenExpTime = DateTime.local()
          .plus({ seconds: data.expires_in })
          .toSeconds();
      });
  },
  getKnowledgeId(knowledgeName) {
    return this.request
      .get(`/knowledge-base?name=${knowledgeName}`, this.getHeaderToken())
      .then(({ data }) => {
        this.botId = data.kb_id;
      });
  },
  sendQuestion(question) {
    return this.request
      .post(`/chat`, { question, bot_id: this.botId }, this.getHeaderToken())
      .then(({ data }) => data);
  },
  getHeaderToken() {
    return {
      headers: { authorization: `Bearer ${this.token}` },
    };
  },
};
