import {callNeoFeed } from "./meshRuntime";

type NEOFeed ={
  elementCount: number;
  objects: Array<{
  id: string; 
  name: string; 
  isPotentiallyHazardousAsteroid: boolean;
  estimatedDiameterMinKm: number; 
  estimatedDiameterMaxKm: number; 
  closeApproachDate: string; 
  relativeVelocityKph: string; 
  missdistance: string;
  }>;
};

/* 
Calls the Mesh SK to fetch NASA NEO data, then maps and flattens the raw
response into the shape consumed by the GraphQL resolver.
*/
export const fetchNearEarthObjects = async (
  startDate: string,
  endDate: string
): Promise<NEOFeed> => {
  const raw = await callNeoFeed(startDate, endDate);

  // The NASA response keys near_earth_objects by date — flatten all dates
  const nearEarthObjectsByDate: Record<string, any[]> =
    raw?.near_earth_objects ?? {};

  const flattened: any[] = Object.values(nearEarthObjectsByDate).flat();

  const objects = flattened.map((item: any) => {
    const est = item?.estimated_diameter?.kilometers ?? {};

    const approach =
      item?.close_approach_data &&
      item.close_approach_data[0]
        ? item.close_approach_data[0]
        : {};

    return {
      id: item.id,
      name: item.name,
      isPotentiallyHazardousAsteroid:
        item.is_potentially_hazardous_asteroid,
      estimatedDiameterMinKm: est.estimated_diameter_min,
      estimatedDiameterMaxKm: est.estimated_diameter_max,
      closeApproachDate: approach.close_approach_date,
      relativeVelocityKph:
        approach.relative_velocity?.kilometers_per_hour,
      missDistanceKm: approach.miss_distance?.kilometers,
    };
  });

  return {
    elementCount: raw?.element_count ?? objects.length,
    objects,
  };
};

export default fetchNearEarthObjects;