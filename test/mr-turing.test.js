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
    const { data } = await getToken(keys);
    const { access_token, token_type } = data;
    MOCK_TOKEN = access_token;
    assert.deepEqual(token_type, "Bearer");
  });

  it("Should bring the bots list", async () => {
    const { data } = await getBotList(MOCK_TOKEN);
    const { results } = data;
    MOCK_BOT_PK = results[0].pk;
    assert.ok(results);
  });

  it("Should make a question to an existent bot and get some answer", async () => {
    const { data } = await makeQuestion(MOCK_QUESTION, MOCK_BOT_PK, MOCK_TOKEN);
    const { conversation_id } = data;
    assert.ok(conversation_id);
  });
});
