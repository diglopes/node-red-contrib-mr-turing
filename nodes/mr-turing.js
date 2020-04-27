const axios = require("axios");

module.exports = function (RED) {
  function MrTuring(config) {
    RED.nodes.createNode(this, config);

    const node = this;
    node.botName = config.botName;
    node.random = config.random || false;
    node.connection = RED.nodes.getNode(config.connection);

    node.status({});

    node.on("input", async (msg, send, done) => {
      msg.payload = "testx";
      send(msg);
      done();
    });
  }
  RED.nodes.registerType("mr-turing", MrTuring);
};

const httpService = {
  token: null,
  botId: null,
  request: axios.create({
    baseURL: "https://backend.cluster.mrturing-k8s.com/rest/",
  }),
  getToken({ username, password, client_id, client_secret }) {
    return this.request.post("/token-service", {
      username,
      password,
      client_id,
      client_secret,
    });
  },
  getKnowledgeId(knowledgeName, token) {
    return this.request
      .get(`/knowledge-base?name=${knowledgeName}`)
      .then(({ data }) => data.kb_id);
  },
  sendQuestion(question, bot_id) {
    return this.request
      .get(`/chat`, { question, bot_id })
      .then(({ data }) => data);
  },
};
