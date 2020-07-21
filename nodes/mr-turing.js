module.exports = function (RED) {
  "use strict";
  const axios = require("axios");
  const { DateTime } = require("luxon");

  function MrTuring(n) {
    RED.nodes.createNode(this, n);

    // Configuration options passed by Node red
    this.botName = n.botName;
    this.random = n.random || false;
    this.connection = RED.nodes.getNode(n.connection);

    // Config node state
    const baseURL = "https://backend.cluster.mrturing-k8s.com/rest/";
    this.http = axios.create({ baseURL });
    this.token = "";
    this.tokenExpTime = null;
    this.selectedBotId = null;
    this.isTokenExpired = () =>
      this.tokenExpTime &&
      this.tokenExpTime - DateTime.local().toSeconds() <= 0;

    this.on("input", async (msg, send, done) => {
      this.status({});
      try {
        if (
          !this.token ||
          typeof this.token !== "string" ||
          this.isTokenExpired()
        ) {
          /**
           * Get a new token if there's no one avaiable
           */
          this.status({ fill: "blue", shape: "dot", text: "Getting token" });
          const {
            clientID: client_id,
            clientSecret: client_secret,
            password,
          } = this.connection.credentials;
          const { data } = await this.http.post("/token-service", {
            client_id,
            client_secret,
            password,
            user: this.connection.user,
          });
          this.token = data.access_token;
          this.tokenExpTime = DateTime.local()
            .plus({ seconds: data.expires_in })
            .toSeconds();
        }

        if (
          (this.token && !this.selectedBotId) ||
          typeof this.selectedBotId !== "number"
        ) {
          /**
           * Get the id related to the choosed bot
           */
          this.status({ fill: "blue", shape: "dot", text: "Getting bot id" });
          const { data } = await this.http.get(
            `/knowledge-base?name=${this.botName}`,
            {
              headers: { Authorization: `Bearer ${this.token}` },
            }
          );
          this.selectedBotId = data.kb_id;
        }

        if (this.selectedBotId && this.token) {
          /**
           * Send a question to Kwonledge base and return a response
           */
          this.status({
            fill: "yellow",
            shape: "dot",
            text: "Sending question",
          });
          const question = msg.payload.question || msg.payload.q || msg.payload;
          if (typeof question === "string") {
            const { data } = await this.http.post(
              "/chat",
              { question, bot_id: this.selectedBotId },
              { headers: { Authorization: `Bearer ${this.token}` } }
            );
            this.status({});
            if (this.random) {
              /**
               * Pick a random answer if the checkbox is selected on Node-red
               */
              const max = data.output.length;
              const min = 0;
              const randomNum = Math.floor(Math.random() * (max - min) + min);
              data.output = data.output[randomNum];
            }
            msg.payload = data;
            send(msg);
            if (done) done();
          }
        }
      } catch (error) {
        this.status({ fill: "red", shape: "ring", text: "Error" });
        if (error.response) {
          const errorResponse = { error: true, data: error.response };
          this.error(errorResponse);
          msg.payload = errorResponse;
          send(msg);
          if (done) done();
          if (error.response.status === 401) {
            /**
             * Reset token when it is invalid
             */
            this.token = null;
            this.tokenExpTime = null;
          }
        } else {
          this.error({ Error: error });
        }
      }
    });
  }
  RED.nodes.registerType("mr-turing", MrTuring);
};
