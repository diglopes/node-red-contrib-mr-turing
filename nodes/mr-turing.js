module.exports = function (RED) {
  "use strict";
  const createMrTuringService = require("../lib/mr-turing-service")
  const createStatusNotifier = require("../lib/status-notifier")
  const mrTuringService = createMrTuringService()
  
  function MrTuring(n) {
    const status = createStatusNotifier(this)
    
    RED.nodes.createNode(this, n);

    // Configuration options passed by Node red
    const node = this
    this.botName = n.botName;
    this.random = n.random || false;
    this.login = RED.nodes.getNode(n.login);
    this.knowledgeBase = n.knowledgeBase

    // Authenticate user
    status.login()
    const { email } = this.login
    const { password } = this.login.credentials
    mrTuringService.login(email, password)
    status.clear()

    // Editor Knowledge bases endpoint
    RED.httpNode.get(`/nodes/${n.id}/mr_turing/knowledge_bases`, async (_, res) => {
      let kbs = await mrTuringService.getKnowledgeBases()
      kbs = Array.isArray(kbs) ? kbs : []
      return res.send({ kbs })
    })

    this.on("input", async (msg, send, done) => {
      status.clear()
      const question = msg.payload
      status.questioning()
      const answers = await mrTuringService.ask(question, this.knowledgeBase)
      msg.payload = answers
      status.clear()
      send(msg)
      done()
    });
  }
  RED.nodes.registerType("mr-turing", MrTuring);
};
