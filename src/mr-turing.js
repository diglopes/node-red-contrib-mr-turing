const getToken = require("./util/getToken");
const getBotList = require("./util/getBotList");
const makeQuestion = require("./util/makeQuestion");

module.exports = function(RED) {
  function MrTuring(config) {
    RED.nodes.createNode(this, config);
    this.clientID = config.clientID;
    this.clientSecret = config.clientSecret;
    this.user = config.user;
    this.password = config.password;
    this.botName = config.botName;
    const node = this;
    node.on("input", async msg => {
      const { access_token } = await getToken(
        node.clientID,
        node.clientSecret,
        node.user,
        node.password,
        node.botName
      );
      const { results } = await getBotList(access_token);

      try {
        const [selectedBot] = results.filter(
          bot =>
            bot.name.toLowerCase().trim() === node.botName.toLowerCase().trim()
        );
        node.status({
          fill: "yellow",
          text: "Receiving Answer",
          shape: "ring"
        });
        msg.payload = await makeQuestion(
          msg.payload,
          selectedBot.pk,
          access_token
        );
        node.status({});
      } catch (error) {
        msg.payload = "Não foi possivel acessar o bot selecionado";
      }

      node.send(msg);
    });
  }
  RED.nodes.registerType("mr-turing", MrTuring);
};
