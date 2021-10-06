module.exports = function (RED) {
  "use strict";
  const NodeCache = require("node-cache")
  const createMrTuringService = require("../lib/mr-turing-service")
  const createStatusNotifier = require("../lib/status-notifier")
  const cache = new NodeCache()
  const constants = require("../lib/constants")
  
  function MrTuring(n) {
    const status = createStatusNotifier(this)
    
    RED.nodes.createNode(this, n);
    
    // Configuration options passed by Node red
    const node = this
    this.botName = n.botName;
    this.random = n.random || false;
    this.login = RED.nodes.getNode(n.login);
    this.knowledgeBase = n.knowledgeBase
    
    // // Authenticate user
    const { email } = this.login
    const { password } = this.login.credentials
    const mrTuringService = createMrTuringService(cache, status, { email, password })
    
    // Editor Knowledge bases endpoint
    RED.httpNode.get(`/nodes/${n.id}/mr_turing/knowledge_bases`, async (_, res) => {
      let kbs = await mrTuringService.getKnowledgeBases()
      kbs = Array.isArray(kbs) ? kbs : []
      return res.send({ kbs })
    })

    this.on("input", async (msg, send, done) => {
      status.clear()
      const question = msg.payload
      try {
        const answers = await mrTuringService.ask(question, this.knowledgeBase)
        msg.payload = answers
        status.clear()
        send(msg)
        done()
      } catch (error) {
        status.error()
        cache.del(constants.cache.TOKEN_KEY)
        done(error)
      }
    });
  }
  RED.nodes.registerType("mr-turing", MrTuring);
};
