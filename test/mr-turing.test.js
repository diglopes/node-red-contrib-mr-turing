const assert = require("assert");
const getToken = require("../util/getToken");
const getBotList = require("../util/getBotList");
const makeQuestion = require("../util/makeQuestion");

const MOCK_TOKEN = "";
const MOCK_BOT_PK = "";

const keys = require("../helpers/keys.json");

describe("Mr turing API Access", function() {
  it("Should get an valid access token", async () => {
    const { token_type, access_token } = await getToken(keys);
    MOCK_TOKEN = access_token;
    assert.deepEqual(token_type, "Bearer");
  });

  it("Should bring the bots list", async () => {
    const { results } = await getBotList(MOCK_TOKEN);
    MOCK_BOT_PK = results[0].pk;
    assert.ok(results);
  });

  it("Should make a question to an existent bot and get some answer", async () => {
    const { conversation_id } = await makeQuestion(MOCK_QUESTION, MOCK_BOT_PK);
    assert.ok(conversation_id);
  });
});
