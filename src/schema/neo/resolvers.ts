// import { fetchNearEarthObjects } from "../../neo/adapter";
// import { ContextType } from "../../types";

// export const resolvers = {
//   Query: {
//     nearEarthObjects: async (_: any, args: { startDate: string; endDate: string }, context: ContextType) => {
//       const { startDate, endDate } = args;
//       context.logger.info("nearEarthObjects", { message: "Fetching NEO feed", startDate, endDate });
//       const result = await fetchNearEarthObjects(startDate, endDate);
//       context.logger.info("nearEarthObjects", { message: "Fetched NEO feed", elementCount: result.elementCount });
//       return result;
//     },
//   },
// };

// export default resolvers;



import { getMeshSDK } from '../../../.mesh';
import { mapNasaNeoFeed } from '../../neo/mapper';

const sdk = getMeshSDK();

export const resolvers = {
  Query: {
    nearEarthObjects: async (
      _: unknown,
      args: {
        startDate: string;
        endDate: string;
      }
    ) => {
      const response = await sdk.neoFeed_query({
        start_date: args.startDate,
        end_date: args.endDate
      });
      console.log("nearEarthObjects", { message: "Fetched NEO feed", response });
       if (!response.neoFeed) {
        return null;
      }

      // Ensure null element_count values are converted to undefined to satisfy mapper typings
      const normalizedFeed = response.neoFeed
        ? { ...response.neoFeed, element_count: response.neoFeed.element_count ?? undefined }
        : null;

      return normalizedFeed ? mapNasaNeoFeed(normalizedFeed as any) : null;
    }
  }
};
