import { Joystick } from "../../src/";

const client = new Joystick({ apiKey: "test" });

// Check types for `getContent` method
(async () => {
  // @ts-expect-no-error - any type is allowed
  (await client.getContent("cid")).name;
  // @ts-expect-no-error - any type is allowed
  (await client.getContent("cid", {})).data;
  (await client.getContent("cid", { refresh: true })).data;

  // @ts-expect-error - full response allows only three fields
  (await client.getContent("cid", { fullResponse: true })).name;

  // @ts-expect-no-error - full response allows only three fields
  (await client.getContent("cid", { fullResponse: true })).data;
  // @ts-expect-no-error - full response allows only three fields
  (await client.getContent("cid", { fullResponse: true })).hash;
  // @ts-expect-no-error - full response allows only three fields
  (await client.getContent("cid", { fullResponse: true })).meta;

  // @ts-expect-error - the string is returned, it doesn't have `data` field
  (await client.getContent("cid", { serialized: true })).data;

  // @ts-expect-error - typescript should throw error, cause `string === number` is always false
  (
    await client.getContent("cid", {
      fullResponse: true,
      serialized: true,
    })
  ).data === 1;
})();

// Check types for `getContents` method
(async () => {
  // @ts-expect-no-error - any type is allowed
  (await client.getContents(["cid1", "cid2"])).cid1;
  (await client.getContents(["cid1", "cid2"])).cid1.nested.property;
  (await client.getContents(["cid1", "cid2"])).cid2;
  (await client.getContents(["cid1", "cid2"])).cid2.another.nested.property;

  (await client.getContents(["cid1", "cid2"], {})).cid2.another.nested.property;
  (await client.getContents(["cid1", "cid2"], { refresh: true })).cid1
    .another(
      await client.getContents(["cid1", "cid2"], {
        fullResponse: false,
        serialized: false,
      })
    )
    .cid1.another(
      await client.getContents(["cid1", "cid2"], {
        fullResponse: false,
        serialized: false,
      })
    )
    .cid1.another(
      await client.getContents(["cid1", "cid2"], {
        fullResponse: false,
        serialized: false,
        refresh: true,
      })
    ).cid1.another.nested.property;

  // @ts-expect-error - only cid is allowed in result object
  (await client.getContents(["cid1"], { fullResponse: true })).cid3;
  // @ts-expect-error - only cid is allowed in result object
  (await client.getContents(["cid1"], { serialized: true })).cid0;
  // @ts-expect-error - only cid is allowed in result object
  (await client.getContents(["cid1"], { refresh: true })).cid0;
  // @ts-expect-error - only cid is allowed in result object
  (
    await client.getContents(["cid1"], {
      serialized: true,
      fullResponse: true,
      refresh: true,
    })
  ).cid0;

  // @ts-expect-error - full response allows only three fields
  (await client.getContents(["cid1"], { fullResponse: true })).cid1.name;

  // @ts-expect-no-error - full response allows only three fields
  (await client.getContent("cid", { fullResponse: true })).data;
  // @ts-expect-no-error - full response allows only three fields
  (await client.getContent("cid", { fullResponse: true })).hash;
  // @ts-expect-no-error - full response allows only three fields
  (await client.getContent("cid", { fullResponse: true })).meta;

  // @ts-expect-error - the string is returned, it doesn't have `data` field
  (await client.getContent("cid", { serialized: true })).data;

  // @ts-expect-error - typescript should throw error, cause `string === number` is always false
  (
    await client.getContent("cid", {
      fullResponse: true,
      serialized: true,
    })
  ).data === 1;
})();
