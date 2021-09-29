module.exports = function (RED) {
  function MrTuringAuth(config) {
    RED.nodes.createNode(this, config);
    this.email = config.email;
  }

  RED.nodes.registerType("mr-turing-auth", MrTuringAuth, {
    credentials: {
      password: {
        type: "password",
        required: true,
      },
    },
  });
};
