import { parse } from 'graphql';

jest.mock('../../src/neo/adapter', () => ({
  fetchNearEarthObjects: jest.fn(),
}));

import { executor } from '../exectuor';
import { fetchNearEarthObjects } from '../../src/neo/adapter';

describe('nearEarthObjects (Ticket 8)', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('Success', async () => {
    const mockFeed = {
      elementCount: 1,
      objects: [
        {
          id: '123',
          name: 'Asteroid 123',
          isPotentiallyHazardousAsteroid: false,
          estimatedDiameterMinKm: 0.1,
          estimatedDiameterMaxKm: 0.3,
          closeApproachDate: '2015-09-07',
          relativeVelocityKph: '12345.6',
          missDistanceKm: '7890.1',
        },
      ],
    };

    (fetchNearEarthObjects as unknown as jest.Mock).mockResolvedValue(mockFeed);

    const query = `
      query NearEarthObjects($startDate: String!, $endDate: String!) {
        nearEarthObjects(startDate: $startDate, endDate: $endDate) {
          elementCount
          objects {
            id
            name
            isPotentiallyHazardousAsteroid
            estimatedDiameterMinKm
            estimatedDiameterMaxKm
            closeApproachDate
            relativeVelocityKph
            missDistanceKm
          }
        }
      }
    `;

    const variables = { startDate: '2015-09-07', endDate: '2015-09-08' };

    const result = await executor({ document: parse(query), variables });

    expect(result).toEqual({
      data: {
        nearEarthObjects: mockFeed,
      },
      metadata: {
        requestId: expect.any(String),
      },
    });
  });

  test('Adapter error surfaces as GraphQL error', async () => {
    (fetchNearEarthObjects as unknown as jest.Mock).mockRejectedValue(new Error('mesh failure'));

    const query = `
      query NearEarthObjects($startDate: String!, $endDate: String!) {
        nearEarthObjects(startDate: $startDate, endDate: $endDate) {
          elementCount
        }
      }
    `;

    const variables = { startDate: '2015-09-07', endDate: '2015-09-08' };

    const result = await executor({ document: parse(query), variables });

    expect(result).toEqual(
      expect.objectContaining({
        data: { nearEarthObjects: null },
        errors: expect.arrayContaining([
          expect.objectContaining({ message: expect.stringContaining('Unexpected error') }),
        ]),
      })
    );
  });
});
