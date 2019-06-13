const getToken = require("./util/getToken");
const getBotList = require("./util/getBotList");
const makeQuestion = require("./util/makeQuestion");

module.exports = function(RED) {
  function MrTuring(config) {
    RED.nodes.createNode(this, config);

    this.botName = config.botName;
    const node = this;
    let token = {};
    let expires_in = 0;
    let botList = {};

    node.connection = RED.nodes.getNode(config.connection);

    node.on("input", async msg => {
      if (!token || new Date().getTime() / 1000 > expires_in) {
        token = await getToken(
          node.connection.credentials.clientID,
          node.connection.credentials.clientSecret,
          node.connection.user,
          node.connection.credentials.password
        );

        const data = await getBotList(token.access_token);
        botList = data.results;
        expires_in = token.expires_in + Math.floor(new Date().getTime() / 1000);
      }

      try {
        const [selectedBot] = botList.filter(
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
          token.access_token
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
