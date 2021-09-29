module.exports = function (RED) {
  "use strict";
  const { DateTime } = require("luxon");
  const mrTuringService = require("../lib/mr-turing-service")

  function MrTuring(n) {
    RED.nodes.createNode(this, n);

    // Configuration options passed by Node red
    const node = this
    this.botName = n.botName;
    this.random = n.random || false;
    this.login = RED.nodes.getNode(n.login);
    this.kbs = []

    // Config node state
    this.token = "";
    const { email } = this.login
    const { password } = this.login.credentials
    mrTuringService
      .login(email, password)
      .then(({ access_token: accessToken }) => {
        node.accessToken = accessToken
      })

    // Editor Knowledge bases endpoint
    RED.httpNode.get(`/nodes/${n.id}/mr_turing/knowledge_bases`, async (_, res) => {
      let kbs = await mrTuringService.getKnowledgeBases(node.accessToken)
      kbs = Array.isArray(kbs) ? kbs : []
      return res.send({ kbs })
    })

    this.on("input", async (msg, send, done) => {
      this.status({});
      msg.payload = "OK"
      this.status({})
      send(msg)
      done()
    });
  }
  RED.nodes.registerType("mr-turing", MrTuring);
};
