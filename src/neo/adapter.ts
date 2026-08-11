import path from "path";

type NEOFeed = {
  elementCount: number;
  objects: Array<Record<string, any>>;
};

export const fetchNearEarthObjects = async (startDate: string, endDate: string): Promise<NEOFeed> => {
  let meshModule: any;
  const runtimeBase = path.resolve(__dirname, "meshRuntime");
  try {
    meshModule = require(runtimeBase);
  } catch (e1) {
    try {
      meshModule = require(runtimeBase + ".js");
    } catch (e2) {
      try {
        const fileUrl = `file://${runtimeBase}.js`;
        meshModule = await import(/* webpackIgnore: true */ fileUrl);
      } catch (e3) {
        throw new Error(
          "Mesh runtime not available at runtime paths. Generate Mesh SDK or add src/neo/meshRuntime.ts"
        );
      }
    }
  }

  const callNeoFeed = meshModule.callNeoFeed ?? meshModule.default?.callNeoFeed;
  if (typeof callNeoFeed !== "function") {
    throw new Error("meshRuntime.callNeoFeed is not implemented");
  }

  const raw = await callNeoFeed(startDate, endDate);

  const nearEarthObjectsByDate = raw?.near_earth_objects || {};
  const flattened: any[] = Object.values(nearEarthObjectsByDate).flat();

  const objects = flattened.map((item: any) => {
    const est = item?.estimated_diameter?.kilometers || {};
    const approach = (item?.close_approach_data && item.close_approach_data[0]) || {};
    return {
      id: item.id,
      name: item.name,
      isPotentiallyHazardousAsteroid: item.is_potentially_hazardous_asteroid,
      estimatedDiameterMinKm: est?.estimated_diameter_min,
      estimatedDiameterMaxKm: est?.estimated_diameter_max,
      closeApproachDate: approach?.close_approach_date,
      relativeVelocityKph: approach?.relative_velocity?.kilometers_per_hour,
      missDistanceKm: approach?.miss_distance?.kilometers,
    };
  });

  return {
    elementCount: raw?.element_count || objects.length,
    objects,
  };
};

export default fetchNearEarthObjects;
