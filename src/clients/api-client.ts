import { GetDynamicContentPayload } from "../models/get-dynamic-content-payload";
import { ApiResponse } from "../models/api-response";
import { PublishContentUpdatePayload } from "../models/publish-content-update-payload";

export interface ApiClient {
  /**
   * Fetch dynamic content from the Joystick API.
   *
   *
   * @param {string[]} contentIds Array of content ids to get
   * @param {GetDynamicContentPayload} payload Request's payload
   *  @param {string} [payload.userId] UserId
   *  @param {string} [payload.semVer] Version of the content to get
   *  @param {Record<string, unknown>} [payload.params] Dynamic params
   * @param {"serialized"} [responseType] Specify the type of response you want to receive
   *
   * @return A promise that resolves to an object with a key for each content id
   *
   */
  getDynamicContent(
    contentIds: readonly string[],
    payload: GetDynamicContentPayload,
    responseType?: "serialized"
  ): Promise<Record<string, ApiResponse>>;

  /**
   * Updates the content of a given configuration.
   *
   *
   * @param {string} contentId Identify the content that is being updated
   * @param {PublishContentUpdatePayload} payload
   *  description: string The description of the content being updated
   *  content: Pass in the new content, description and dynamiccontentmap
   *
   */
  publishContentUpdate(
    contentId: string,
    payload: PublishContentUpdatePayload
  ): Promise<void>;
}
