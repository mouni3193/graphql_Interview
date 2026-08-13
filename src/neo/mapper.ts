interface NasaNeo {
  id?: string;
  name?: string;
  is_potentially_hazardous_asteroid?: boolean;

  estimated_diameter?: {
    kilometers?: {
      estimated_diameter_min?: number;
      estimated_diameter_max?: number;
    };
  };

  close_approach_data?: Array<{
    close_approach_date?: string;

    relative_velocity?: {
      kilometers_per_hour?: string;
    };

    miss_distance?: {
      kilometers?: string;
    };
  }>;
}

interface NasaNeoFeed {
  element_count?: number;

  near_earth_objects?: Record<string, NasaNeo[]>;
}

export function mapNasaNeoFeed(
  feed: NasaNeoFeed
) {
  const objects = Object.values(
    feed.near_earth_objects ?? {}
  ).flat();

  return {
    elementCount: feed.element_count ?? 0,

    objects: objects.map((neo) => {
      const approach = neo.close_approach_data?.[0];

      return {
        id: neo.id ?? null,
        name: neo.name ?? null,

        isPotentiallyHazardousAsteroid:
          neo.is_potentially_hazardous_asteroid ?? null,

        estimatedDiameterMinKm:
          neo.estimated_diameter
            ?.kilometers
            ?.estimated_diameter_min ?? null,

        estimatedDiameterMaxKm:
          neo.estimated_diameter
            ?.kilometers
            ?.estimated_diameter_max ?? null,

        closeApproachDate:
          approach?.close_approach_date ?? null,

        relativeVelocityKph:
          approach?.relative_velocity
            ?.kilometers_per_hour ?? null,

        missDistanceKm:
          approach?.miss_distance
            ?.kilometers ?? null
      };
    })
  };
}