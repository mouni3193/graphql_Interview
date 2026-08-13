import { fetchNearEarthObjects } from "../../neo/adapter";
import { ContextType } from "../../types";

export const resolvers = {
  Query: {
    nearEarthObjects: async (_: any, args: { startDate: string; endDate: string }, context: ContextType) => {
      const { startDate, endDate } = args;
      context.logger.info("nearEarthObjects", { message: "Fetching NEO feed", startDate, endDate });
      const result = await fetchNearEarthObjects(startDate, endDate);
      context.logger.info("nearEarthObjects", { message: "Fetched NEO feed", elementCount: result.elementCount });
      return result;
    },
  },
};

export default resolvers;