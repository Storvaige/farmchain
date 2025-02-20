require("../scripts/polyfillFetch");
const { expect } = require("chai");
const { create } = require("ipfs-http-client");

describe("Local IPFS Tests", function () {
  let ipfs;
  before(async function () {
    // Connect to local IPFS daemon on 127.0.0.1:5001
    ipfs = create({
      host: "127.0.0.1",
      port: 5001,
      protocol: "http",
    });
  });

  it("Should upload text data and retrieve it", async function () {
    const data = "Hello from IPFS test!";

    // 1) Add the data to IPFS
    const result = await ipfs.add(data);
    const cid = result.cid.toString();
    expect(cid).to.be.a("string");

    // 2) Retrieve (cat) the data from IPFS
    const chunks = [];
    for await (const chunk of ipfs.cat(cid)) {
      chunks.push(chunk);
    }
    const retrieved = Buffer.concat(chunks).toString();

    // 3) Check that the data matches
    expect(retrieved).to.equal(data);
  });
});
