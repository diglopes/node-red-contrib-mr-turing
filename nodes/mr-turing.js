const axios = require("axios");
const { DateTime } = require("luxon");

module.exports = function (RED) {
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
      try {
        let response = null;
        try {
          node.status({ fill: "yellow", shape: "dot", text: "asking..." });
          response = await askQuestionToBot(
            msg.payload,
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
      } catch (error) {
        node.status({
          fill: "red",
          shape: "ring",
          text: "question not sended",
        });
        node.error(error);
      }
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
