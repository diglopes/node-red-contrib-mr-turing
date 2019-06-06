const getToken = require("./util/getToken");
const getBotList = require("./util/getBotList");

module.exports = function(RED) {
  function MrTuringAuth(config) {
    RED.nodes.createNode(this, config);
    this.clientID = config.clientID;
    this.clientSecret = config.clientSecret;
    this.user = config.user;
    this.password = config.password;
    const node = this;
    node.on("input", async msg => {
      const { access_token } = await getToken(
        node.clientID,
        node.clientSecret,
        node.user,
        node.password
      );
      const { results } = await getBotList(access_token);
      msg.payload = results;
      node.send(msg);
    });
  }
  RED.nodes.registerType("mr-turing-auth", MrTuringAuth);
};
