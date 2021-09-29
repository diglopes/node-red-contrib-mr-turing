module.exports = function (RED) {
  "use strict";
  const { DateTime } = require("luxon");
  const mrTuringService = require("../lib/mr-turing-service")

  function MrTuring(n) {
    RED.nodes.createNode(this, n);

    // Configuration options passed by Node red
    this.botName = n.botName;
    this.random = n.random || false;
    this.login = RED.nodes.getNode(n.login);

    // Config node state
    this.token = "";

    this.on("input", async (msg, send, done) => {
      this.status({});
      const { email } = this.login
      const { password } = this.login.credentials

      const authResponse = await mrTuringService.login(email, password)
    
      msg.payload = authResponse

      this.status({})
      send(msg)
      done()
    });
  }
  RED.nodes.registerType("mr-turing", MrTuring);
};
