const assert = require("assert");
const getToken = require("../util/getToken");
const getBotList = require("../util/getBotList");
const makeQuestion = require("../util/makeQuestion");

let MOCK_TOKEN = "";
let MOCK_BOT_PK = "";
let MOCK_QUESTION = "a";

const keys = require("../helpers/keys.json");

describe("Mr turing API Access", function() {
  it("Should get an valid access token", async () => {
    const { access_token, token_type } = await getToken(
      keys.client_id,
      keys.client_secret,
      keys.user,
      keys.password
    );
    MOCK_TOKEN = access_token;
    assert.deepEqual(token_type, "Bearer");
  });

  it("Should bring the bots list", async () => {
    const { results } = await getBotList(MOCK_TOKEN);
    MOCK_BOT_PK = results[0].pk;
    assert.ok(results);
  });

  it("Should make a question to an existent bot and get some answer", async () => {
    const { conversation_id } = await makeQuestion(
      MOCK_QUESTION,
      MOCK_BOT_PK,
      MOCK_TOKEN
    );
    assert.ok(conversation_id);
  });
});
