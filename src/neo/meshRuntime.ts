import { getMeshSDK } from "../../.mesh";

const sdk = getMeshSDK();

/**
 * Calls the NASA NEO Feed endpoint via the generated Mesh SDK.
 * Returns the raw NASA API response (un-transformed).
 */
export const callNeoFeed = async (
  startDate: string,
  endDate: string
): Promise<any> => {
  const result = await sdk.GetNeoFeed({
    start_date: startDate,
    end_date: endDate,
    api_key: "DEMO_KEY",
  });

  if (!result.getNeoFeed) {
    throw new Error("No data returned from NASA NEO Feed");
  }

  return result.getNeoFeed;
};

export default { callNeoFeed };