import { ApiClient } from "../../src/services/api-client";
import { anyString, anything, instance, mock, when } from "ts-mockito";
import { Client } from "../../src/clients/client";

describe("ApiClient", () => {
  it("getContent", () => {
    const mockClient = mock(Client);

    when(mockClient.post(anyString(), anything())).thenReturn();

    const client = instance(mockClient);

    const sut = new ApiClient(client);

    expect(sut.getContent("123456789012345678901234567", {}));
  });
});
