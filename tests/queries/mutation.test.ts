import { parse } from 'graphql';
import { executor } from '../exectuor';

describe('mutation and header enforcement', () => {
  test('createAddress succeeds with client header', async () => {
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

    const username = `alice-${Date.now()}`;
    const variables = {
      username,
      input: {
        street: '789 New Ave',
        city: 'Metrocity',
        zipcode: '98765',
        state: 'WA',
      },
    };

    const result = await executor({
      document: parse(mutation),
      variables,
      extensions: { headers: { client: 'my-test-client' } },
    } as any);

    expect(result).toEqual({
      data: {
        createAddress: {
          street: '789 New Ave',
          city: 'Metrocity',
          zipcode: '98765',
          state: 'WA',
        },
      },
      metadata: {
        requestId: expect.any(String),
      },
    });
  });

  test('mutation rejected for strata client', async () => {
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

    const variables = {
      username: 'bob',
      input: {
        street: '1010 Edge St',
        city: 'Boundary',
        zipcode: '11111',
        state: 'TX',
      },
    };

    const result = await executor({
      document: parse(mutation),
      variables,
      extensions: { headers: { client: 'strata' } },
    } as any);

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Mutations are not allowed for client "strata"',
          }),
        ]),
      }),
    );
  });

  test('request rejected when client header missing', async () => {
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
      extensions: { headers: {} },
    } as any);

    expect(result).toEqual(
      expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            message: 'Missing required header: client',
          }),
        ]),
      }),
    );
  });
});
