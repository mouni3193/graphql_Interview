import { parse } from 'graphql';
import { infoMock, resetMocks } from '../winstonMock';

jest.mock('winston', () => {
  const winstonMock = require('../winstonMock');
  return {
    __esModule: true,
    default: winstonMock.default,
    format: winstonMock.format,
    transports: winstonMock.transports,
  };
});

import { executor } from '../exectuor';

describe('Ticket 4 & 5: Logging with requestId and client', () => {
  beforeEach(() => {
    resetMocks();
  });

  test('Ticket 4: requestId is generated and returned in response metadata', async () => {
    const query = `
      query GetAddress($username: String!) {
        address(username: $username) {
          street
          city
          zipcode
          state
        }
      }
    `;

    const variables = { username: 'jack' };

    const result = await executor({
      document: parse(query),
      variables,
      extensions: { headers: { client: 'test-client' } },
    } as any) as any;

    expect(result.metadata).toBeDefined();
    expect(result.metadata.requestId).toBeDefined();
    expect(typeof result.metadata.requestId).toBe('string');
    expect(result.metadata.requestId.length).toBeGreaterThan(0);
  });

  test('Ticket 5: client header is logged in the response context', async () => {
    const mutation = `
      mutation CreateAddress($username: String!, $input: AddressInput!) {
        createAddress(username: $username, input: $input) {
          street
          city
          zipcode
          state
        }
      }
    `;

    const username = `logging-test-${Date.now()}`;
    const testClient = 'my-logging-test-client';
    const variables = {
      username,
      input: {
        street: '500 Log St',
        city: 'Logville',
        zipcode: '55555',
        state: 'IL',
      },
    };

    const result = await executor({
      document: parse(mutation),
      variables,
      extensions: { headers: { client: testClient } },
    } as any) as any;

   
    expect(result.data).toBeDefined();
    expect(result.data.createAddress).toBeDefined();
    expect(result.data.createAddress.street).toBe('500 Log St');
    expect(result.metadata?.requestId).toBeDefined();
    expect(infoMock).toHaveBeenCalled();
    expect(infoMock.mock.calls.every(([, meta]) => meta?.client === testClient)).toBe(true);
    expect(infoMock.mock.calls.some(([, meta]) => meta?.requestId === result.metadata?.requestId)).toBe(true);
  });

  test('Ticket 4 & 5: requestId is unique per request and client is passed through', async () => {
    const query = `
      query GetAddress($username: String!) {
        address(username: $username) {
          street
          city
          zipcode
          state
        }
      }
    `;

    const testClient = 'combined-test-client';
    const variables = { username: 'jack' };

    const result1 = await executor({
      document: parse(query),
      variables,
      extensions: { headers: { client: testClient } },
    } as any) as any;

    const result2 = await executor({
      document: parse(query),
      variables,
      extensions: { headers: { client: testClient } },
    } as any) as any;

    expect(result1.metadata?.requestId).toBeDefined();
    expect(result2.metadata?.requestId).toBeDefined();
    expect(result1.metadata.requestId).not.toBe(result2.metadata.requestId);

    expect(result1.data?.address?.city).toBe('Sometown');
    expect(result2.data?.address?.city).toBe('Sometown');
  });

  test('Ticket 4: requestId appears in logs (manual verification via console output)', async () => {
   
    const query = `
      query GetAddress($username: String!) {
        address(username: $username) {
          street
          city
          zipcode
          state
        }
      }
    `;

    const result = await executor({
      document: parse(query),
      variables: { username: 'jack' },
      extensions: { headers: { client: 'test-client' } },
    } as any) as any;

    expect(result.metadata?.requestId).toBeDefined();
    expect(infoMock).toHaveBeenCalled();
    expect(infoMock.mock.calls.every(([, meta]) => meta?.requestId === result.metadata?.requestId)).toBe(true);
  });

  test('Ticket 5: client header appears in logs (manual verification via console output)', async () => {
   
    const mutation = `
      mutation CreateAddress($username: String!, $input: AddressInput!) {
        createAddress(username: $username, input: $input) {
          street
          city
          zipcode
          state
        }
      }
    `;

    const testClient = 'ticket-5-test-client';
    const variables = {
      username: `ticket5-${Date.now()}`,
      input: {
        street: '555 Client St',
        city: 'ClientCity',
        zipcode: '55555',
        state: 'CA',
      },
    };

    const result = await executor({
      document: parse(mutation),
      variables,
      extensions: { headers: { client: testClient } },
    } as any) as any;

    expect(result.data?.createAddress).toBeDefined();
    expect(result.metadata?.requestId).toBeDefined();
    expect(infoMock).toHaveBeenCalled();
    expect(infoMock.mock.calls.every(([, meta]) => meta?.client === testClient)).toBe(true);
    expect(infoMock.mock.calls.some(([, meta]) => meta?.requestId === result.metadata?.requestId)).toBe(true);
  });
});
