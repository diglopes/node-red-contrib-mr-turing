const assert = require("assert");
const getToken = require("../util/getToken");
const getBotList = require("../util/getBotList");
const makeQuestion = require("../util/makeQuestion");

const MOCK_TOKEN = "";

const keys = require("../helpers/keys.json");

describe("Mr turing API Access", function() {
  it("Should get an valid access token", async () => {
    const { token_type, access_token } = await getToken(keys);
    MOCK_TOKEN = access_token;
    assert.deepEqual(token_type, "Bearer");
  });

  it("Should bring the bots list", async () => {
    const { results } = await getBotList(MOCK_TOKEN);
    assert.ok(results);
  });
});
