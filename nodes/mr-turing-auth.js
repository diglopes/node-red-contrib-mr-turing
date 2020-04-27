const getToken = require("../src/util/getToken");
const getBotList = require("../src/util/getBotList");

module.exports = function(RED) {
  function MrTuringAuth(config) {
    RED.nodes.createNode(this, config);
    let node = this;

    // Variables
    node.user = config.user;
    const clientID = node.credentials.clientID;
    const clientSecret = node.credentials.clientSecret;
    const password = node.credentials.password;
  }

  RED.nodes.registerType("mr-turing-auth", MrTuringAuth, {
    credentials: {
      clientID: {
        type: "passoword",
        required: true
      },
      clientSecret: {
        type: "passoword",
        required: true
      },
      password: {
        type: "passoword",
        required: true
      }
    }
  });
};
