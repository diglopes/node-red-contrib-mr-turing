const getToken = require("./util/getToken");
const getBotList = require("./util/getBotList");
const makeQuestion = require("./util/makeQuestion");

module.exports = function(RED) {
  function MrTuring(config) {
    RED.nodes.createNode(this, config);

    const node = this;
    node.botName = config.botName;
    node.random = config.random || false;
    node.connection = RED.nodes.getNode(config.connection);
    let token = {};
    let expires_in = 0;
    let botList = {};

    node.status({});

    node.on("input", async msg => {
      try {
        if (!token || new Date().getTime() / 1000 > expires_in) {
          token = await getToken(
            node.connection.credentials.clientID,
            node.connection.credentials.clientSecret,
            node.connection.user,
            node.connection.credentials.password
          );

          const data = await getBotList(token.access_token);
          botList = data.results;
          expires_in =
            token.expires_in + Math.floor(new Date().getTime() / 1000);
        }

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
          msg.payload.question,
          selectedBot.pk,
          token.access_token
        );
        node.status({});
        if (node.random) {
          const random = Math.floor(Math.random() * msg.payload.output.length);
          const { conversation_id, output } = msg.payload;
          msg.payload = {
            conversation_id,
            random_output: output[random]
          };

          node.send(msg);
        } else {
          node.send(msg);
        }
      } catch (error) {
        node.status({ fill: "red", shape: "ring", text: "chat fail" });

        if (error.message.includes("pk")) {
          error.message = "Couldn't found the chatbot named";
        }
        if (error.message.includes("401")) {
          error.message = "Couldn't authenticate";
        }
        if (error.message.includes("400")) {
          error.message = "msg.payload doesn't have the 'question' key";
        }

        node.error(error);
      }
    });
  }
  RED.nodes.registerType("mr-turing", MrTuring);
};
