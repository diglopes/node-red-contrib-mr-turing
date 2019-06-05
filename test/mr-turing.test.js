const assert = require("assert");
const getToken = require("../util/getToken");
const getBotList = require("../util/getBotList");
const makeQuestion = require("../util/makeQuestion");

const keys = require("../helpers/keys.json");

describe("Mr turing API Access", function() {
  it("Should get an valid access token", async () => {
    const { token_type } = await getToken(keys);
    assert.deepEqual(token_type, "Bearer");
  });
});
