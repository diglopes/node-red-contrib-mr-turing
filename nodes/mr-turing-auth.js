module.exports = function (RED) {
  function MrTuringAuth(config) {
    RED.nodes.createNode(this, config);
    let node = this;
    node.user = config.user;
  }

  RED.nodes.registerType("mr-turing-auth", MrTuringAuth, {
    credentials: {
      clientID: {
        type: "passoword",
        required: true,
      },
      clientSecret: {
        type: "passoword",
        required: true,
      },
      password: {
        type: "passoword",
        required: true,
      },
    },
  });
};
