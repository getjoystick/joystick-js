import { Joystick } from "../../src/";
import { expectTypeOf } from "expect-type";
import { ApiResponse } from "../../src/models/api-response";

const client = new Joystick({ apiKey: "test" });

// ! ||--------------------------------------------------------------------------------||
// ! ||      This file is not executed with Jest, it will be checked only by `tsc`     ||
// ! ||--------------------------------------------------------------------------------||

// Check types for `getContent` method
(async function getContentTypesTest() {
  (async function getContentAnyTypeIsExpected() {
    // @ts-expect-no-error - any type is allowed
    const anyResult = await client.getContent("cid1");

    // @ts-expect-no-error
    anyResult.nested.property;
    // @ts-expect-no-error
    anyResult.another_nested.property;

    // empty object is allowed
    expectTypeOf(await client.getContent("cid1", {})).toBeAny();
    // refresh true should not change the type
    expectTypeOf(await client.getContent("cid2", { refresh: true })).toBeAny();
    expectTypeOf(await client.getContent("cid1", { refresh: true })).toBeAny();
    // serialized and fullResponse set to false should not change the type
    expectTypeOf(
      (
        await client.getContent("cid1", {
          fullResponse: false,
          serialized: false,
        })
      ).cid1
    ).toBeAny();
    expectTypeOf(
      (
        await client.getContent("cid1", {
          fullResponse: false,
          serialized: false,
        })
      ).cid2
    ).toBeAny();

    // Combination of options should not change the type
    expectTypeOf(
      (
        await client.getContent("cid1", {
          fullResponse: false,
          serialized: false,
          refresh: true,
        })
      ).cid2
    ).toBeAny();
  })();

  (async function getContentWithFullResponseShouldReturnApiResponse() {
    expectTypeOf(
      await client.getContent("cid1", { fullResponse: true })
    ).toEqualTypeOf<ApiResponse<any>>();

    // @ts-expect-no-error - full response allows only three fields
    (await client.getContent("cid1", { fullResponse: true })).data;
    // @ts-expect-no-error - full response allows only three fields
    (await client.getContent("cid2", { fullResponse: true })).hash;
    // @ts-expect-no-error - full response allows only three fields
    (await client.getContent("cid3", { fullResponse: true })).meta;

    expectTypeOf(
      await client.getContent("cid1", { fullResponse: true, refresh: true })
    ).toEqualTypeOf<ApiResponse<any>>();

    expectTypeOf(
      await client.getContent("cid1", { fullResponse: true, refresh: false })
    ).toEqualTypeOf<ApiResponse<any>>();

    expectTypeOf(
      await client.getContent("cid1", {
        fullResponse: true,
        serialized: true,
      })
    ).toEqualTypeOf<ApiResponse<string>>();

    expectTypeOf(
      await client.getContent("cid1", {
        fullResponse: true,
        serialized: true,
        refresh: false,
      })
    ).toEqualTypeOf<ApiResponse<string>>();

    expectTypeOf(
      await client.getContent("cid1", {
        fullResponse: true,
        serialized: true,
        refresh: true,
      })
    ).toEqualTypeOf<ApiResponse<string>>();
  })();

  (async function getContentWithSerialized() {
    expectTypeOf(
      await client.getContent("cid1", { serialized: true })
    ).toEqualTypeOf<string>();

    expectTypeOf(
      await client.getContent("cid1", { serialized: true, refresh: false })
    ).toEqualTypeOf<string>();

    expectTypeOf(
      await client.getContent("cid1", {
        serialized: true,
        refresh: false,
        fullResponse: false,
      })
    ).toEqualTypeOf<string>();

    expectTypeOf(
      await client.getContent("cid1", {
        serialized: true,
        refresh: true,
        fullResponse: false,
      })
    ).toEqualTypeOf<string>();
  })();

  (async function getContentWithGenerics() {
    type A = {
      a: string;
      b: number;
    };

    expectTypeOf(await client.getContent<A>("cid1")).toEqualTypeOf<A>();
    expectTypeOf(await client.getContent<A>("cid1", {})).toEqualTypeOf<A>();
    expectTypeOf(
      await client.getContent<A>("cid1", { refresh: true })
    ).toEqualTypeOf<A>();
    expectTypeOf(
      await client.getContent<A>("cid1", { refresh: true, fullResponse: false })
    ).toEqualTypeOf<A>();
    expectTypeOf(
      await client.getContent<A>("cid1", {
        refresh: true,
        fullResponse: false,
        serialized: false,
      })
    ).toEqualTypeOf<A>();

    expectTypeOf(
      await client.getContent<A>("cid1", { fullResponse: true })
    ).toEqualTypeOf<ApiResponse<A>>();
    expectTypeOf(
      await client.getContent<A>("cid1", { fullResponse: true, refresh: true })
    ).toEqualTypeOf<ApiResponse<A>>();
    expectTypeOf(
      await client.getContent<A>("cid1", { fullResponse: true, refresh: false })
    ).toEqualTypeOf<ApiResponse<A>>();
    expectTypeOf(
      await client.getContent<A>("cid1", {
        fullResponse: true,
        refresh: false,
        serialized: false,
      })
    ).toEqualTypeOf<ApiResponse<A>>();

    // Serialized true with generics should always return never
    expectTypeOf(
      await client.getContent<A>("cid1", {
        fullResponse: true,
        serialized: true,
      })
    ).toBeNever();
    expectTypeOf(
      await client.getContent<A>("cid1", { serialized: true })
    ).toBeNever();
  })();
})();

// Check types for `getContents` method
(async function getContentsTypesTest() {
  (async function getContentsAnyTypeIsExpected() {
    // @ts-expect-no-error - any type is allowed
    const anyResult = await client.getContents(["cid1", "cid2"]);
    expectTypeOf(anyResult.cid1).toBeAny();
    expectTypeOf(anyResult.cid2).toBeAny();
    // @ts-expect-no-error
    anyResult.cid1.nested.property;
    // @ts-expect-no-error
    anyResult.cid2;

    // empty object is allowed
    expectTypeOf(
      (await client.getContents(["cid1", "cid2"], {})).cid1
    ).toBeAny();
    expectTypeOf(
      (await client.getContents(["cid1", "cid2"], {})).cid2
    ).toBeAny();
    // refresh true should not change the type
    expectTypeOf(
      (await client.getContents(["cid1", "cid2"], { refresh: true })).cid1
    ).toBeAny();
    expectTypeOf(
      (await client.getContents(["cid1", "cid2"], { refresh: true })).cid2
    ).toBeAny();
    // serialized and fullResponse set to false should not change the type
    expectTypeOf(
      (
        await client.getContents(["cid1", "cid2"], {
          fullResponse: false,
          serialized: false,
        })
      ).cid1
    ).toBeAny();
    expectTypeOf(
      (
        await client.getContents(["cid1", "cid2"], {
          fullResponse: false,
          serialized: false,
        })
      ).cid2
    ).toBeAny();

    // Combination of options should not change the type
    expectTypeOf(
      (
        await client.getContents(["cid1", "cid2"], {
          fullResponse: false,
          serialized: false,
          refresh: true,
        })
      ).cid2
    ).toBeAny();
  })();

  (async function getContentsShouldAlwaysReturnContentIdsAsKeys() {
    expectTypeOf(
      await client.getContents(["cid1"], { fullResponse: true })
    ).toEqualTypeOf<{
      cid1: ApiResponse<any>;
    }>();
    // @ts-expect-error - only cid1 is allowed in result object
    (await client.getContents(["cid1"], { fullResponse: true })).cid3;

    expectTypeOf(
      await client.getContents(["cid1"], { serialized: true })
    ).toEqualTypeOf<{
      cid1: string;
    }>();
    // @ts-expect-error - only cid1 is allowed in result object
    (await client.getContents(["cid1"], { serialized: true })).cid0;

    expectTypeOf(
      await client.getContents(["cid1"], { refresh: true })
    ).toEqualTypeOf<{
      cid1: any;
    }>();
    // @ts-expect-error - only cid1 is allowed in result object
    (await client.getContents(["cid1"], { refresh: true })).cid0;

    expectTypeOf(
      await client.getContents(["cid1"], {
        serialized: true,
        fullResponse: true,
        refresh: true,
      })
    ).toEqualTypeOf<{
      cid1: ApiResponse<string>;
    }>();
  })();

  (async function getContentsWithFullResponseShouldReturnApiResponse() {
    expectTypeOf(
      await client.getContents(["cid1"], { fullResponse: true })
    ).toEqualTypeOf<{
      cid1: ApiResponse<any>;
    }>();

    // @ts-expect-no-error - full response allows only three fields
    (await client.getContents(["cid1"], { fullResponse: true })).cid1.data;
    // @ts-expect-no-error - full response allows only three fields
    (await client.getContents(["cid1", "cid2"], { fullResponse: true })).cid2
      .hash;
    // @ts-expect-no-error - full response allows only three fields
    (await client.getContents(["cid1", "cid2", "cid3"], { fullResponse: true }))
      .cid3.meta;

    expectTypeOf(
      await client.getContents(["cid1"], { fullResponse: true, refresh: true })
    ).toEqualTypeOf<{
      cid1: ApiResponse<any>;
    }>();

    expectTypeOf(
      await client.getContents(["cid1"], { fullResponse: true, refresh: false })
    ).toEqualTypeOf<{
      cid1: ApiResponse<any>;
    }>();

    expectTypeOf(
      await client.getContents(["cid1", "cid2"], {
        fullResponse: true,
        serialized: true,
      })
    ).toEqualTypeOf<{
      cid1: ApiResponse<string>;
      cid2: ApiResponse<string>;
    }>();

    expectTypeOf(
      await client.getContents(["cid1", "cid2"], {
        fullResponse: true,
        serialized: true,
        refresh: false,
      })
    ).toEqualTypeOf<{
      cid1: ApiResponse<string>;
      cid2: ApiResponse<string>;
    }>();

    expectTypeOf(
      await client.getContents(["cid1", "cid2"], {
        fullResponse: true,
        serialized: true,
        refresh: true,
      })
    ).toEqualTypeOf<{
      cid1: ApiResponse<string>;
      cid2: ApiResponse<string>;
    }>();
  })();

  (async function getContentsWithSerialized() {
    expectTypeOf(
      await client.getContents(["cid1"], { serialized: true })
    ).toEqualTypeOf<{
      cid1: string;
    }>();

    expectTypeOf(
      await client.getContents(["cid1", "cid2", "cid3"], { serialized: true })
    ).toEqualTypeOf<{
      cid1: string;
      cid2: string;
      cid3: string;
    }>();

    expectTypeOf(
      await client.getContents(["cid1"], { serialized: true, refresh: false })
    ).toEqualTypeOf<{
      cid1: string;
    }>();

    expectTypeOf(
      await client.getContents(["cid1"], {
        serialized: true,
        refresh: false,
        fullResponse: false,
      })
    ).toEqualTypeOf<{
      cid1: string;
    }>();

    expectTypeOf(
      await client.getContents(["cid1"], {
        serialized: true,
        refresh: true,
        fullResponse: false,
      })
    ).toEqualTypeOf<{
      cid1: string;
    }>();
  })();

  (async function getContentsWithGenerics() {
    type CID1 = {
      a: string;
    };

    type CID2 = {
      b: number;
    };
    type A = {
      cid1: CID1;
      cid2: CID2;
    };

    // @ts-expect-error - only cids from `A` type are allowed
    await client.getContents<A>(["cid2", "cid3"]);

    expectTypeOf(
      await client.getContents<A>(["cid1", "cid2"])
    ).toEqualTypeOf<A>();
    expectTypeOf(
      await client.getContents<A>(["cid1", "cid2"], {})
    ).toEqualTypeOf<A>();
    expectTypeOf(
      await client.getContents<A>(["cid1", "cid2"], { refresh: true })
    ).toEqualTypeOf<A>();
    expectTypeOf(
      await client.getContents<A>(["cid1", "cid2"], { fullResponse: false })
    ).toEqualTypeOf<A>();
    expectTypeOf(
      await client.getContents<A>(["cid1", "cid2"], { serialized: false })
    ).toEqualTypeOf<A>();
    expectTypeOf(
      await client.getContents<A>(["cid1", "cid2"], {
        refresh: true,
        serialized: false,
        fullResponse: false,
      })
    ).toEqualTypeOf<A>();

    expectTypeOf(
      await client.getContents<A>(["cid1", "cid2"], { fullResponse: true })
    ).toEqualTypeOf<{
      cid1: ApiResponse<CID1>;
      cid2: ApiResponse<CID2>;
    }>();

    expectTypeOf(
      await client.getContents<{
        cid1: CID1;
        cid2: CID2;
      }>(["cid1", "cid2"], { fullResponse: true })
    ).toEqualTypeOf<{
      cid1: ApiResponse<CID1>;
      cid2: ApiResponse<CID2>;
    }>();

    expectTypeOf(
      await client.getContents<{
        cid1: CID1;
        cid2: CID2;
      }>(["cid1", "cid2"], { fullResponse: true, refresh: true })
    ).toEqualTypeOf<{
      cid1: ApiResponse<CID1>;
      cid2: ApiResponse<CID2>;
    }>();

    expectTypeOf(
      await client.getContents<{
        cid1: CID1;
        cid2: CID2;
      }>(["cid1", "cid2"], { fullResponse: true, refresh: false })
    ).toEqualTypeOf<{
      cid1: ApiResponse<CID1>;
      cid2: ApiResponse<CID2>;
    }>();

    expectTypeOf(
      await client.getContents<{
        cid1: CID1;
        cid2: CID2;
      }>(["cid1", "cid2"], { fullResponse: true, serialized: false })
    ).toEqualTypeOf<{
      cid1: ApiResponse<CID1>;
      cid2: ApiResponse<CID2>;
    }>();

    expectTypeOf(
      await client.getContents<{
        cid1: CID1;
        cid2: CID2;
      }>(["cid1", "cid2"], {
        fullResponse: true,
        serialized: false,
        refresh: true,
      })
    ).toEqualTypeOf<{
      cid1: ApiResponse<CID1>;
      cid2: ApiResponse<CID2>;
    }>();

    // Serialized true with generics should always return never

    expectTypeOf(
      await client.getContents<A>(["cid1", "cid2"], {
        serialized: true,
      })
    ).toBeNever();
    expectTypeOf(
      await client.getContents<A>(["cid1", "cid2"], {
        serialized: true,
        fullResponse: true,
        refresh: true,
      })
    ).toBeNever();
  })();
})();
