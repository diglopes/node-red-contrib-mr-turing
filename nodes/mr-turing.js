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
        node.status({ fill: "yellow", shape: "dot", text: "asking..." });
        const { output } = await askQuestionToBot(
          msg.payload,
          credentials,
          node.botName
        );
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
          shape: "dot",
          text: "not sended",
        });
        node.error(error);
      }
    });
  }
  RED.nodes.registerType("mr-turing", MrTuring);
};

const askQuestionToBot = async (question, credentials = {}, botName) => {
  const { tokenExpTime } = httpService;
  const isTokenValid = tokenExpTime && validateTokenExpTime(tokenExpTime);
  if (!isTokenValid) await httpService.getToken(credentials);
  if (!httpService.botId) await httpService.getKnowledgeId(botName);
  return httpService.sendQuestion(question);
};

const validateTokenExpTime = (expirationTime) =>
  expirationTime - DateTime.local().toSeconds() > 0;

const request = axios.create({
  baseURL: "https://backend.cluster.mrturing-k8s.com/rest/",
});

const httpService = {
  tokenExpTime: null,
  botId: null,
  request,
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
        this.tokenExpTime = DateTime.local()
          .plus({ seconds: data.expires_in })
          .toSeconds();
        this.setTokenToHeaders(data.access_token);
      });
  },
  getKnowledgeId(knowledgeName) {
    return this.request
      .get(`/knowledge-base?name=${knowledgeName}`)
      .then(({ data }) => {
        this.botId = data.kb_id;
      });
  },
  sendQuestion(question) {
    return this.request
      .post(`/chat`, { question, bot_id: this.botId })
      .then(({ data }) => data);
  },
  setTokenToHeaders(token) {
    request.interceptors.request.use(
      (config) => {
        config.headers.common.Authorization = `Bearer ${token}`;
        return config;
      },
      (response) => Promise.reject(response)
    );
  },
};
