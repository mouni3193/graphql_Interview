import { Addresses, Address, Args, AddressInput } from './types';
import { GraphQLError } from 'graphql';
import { readAddresses, writeAddresses } from './storage';
import { ContextType } from '../../types';

const _getAddress = async (username: string): Promise<Address | null> => {
  const addresses = await readAddresses();
  return addresses[username] ?? null;
};

export const getAddress = async (_: any, args: Args, context: ContextType): Promise<Address> => {
  context.logger.info('getAddress', { message: 'Enter resolver' });
  const address = await _getAddress(args.username);
  if (address) {
    context.logger.info('getAddress', { message: 'Returning address' });
    return address;
  }
  context.logger.error('getAddress', { message: 'No address found' });
  throw new GraphQLError('No address found in getAddress resolver');
};

export const createAddress = async (_: any, args: { username: string; input: AddressInput }, context: ContextType): Promise<Address> => {
  const { username, input } = args;
  context.logger.info('createAddress', { username });
  const addresses = await readAddresses();
  if (addresses[username]) {
    context.logger.error('createAddress', { username, reason: 'exists' });
    throw new GraphQLError('Address already exists for username');
  }
  addresses[username] = input;
  await writeAddresses(addresses);
  context.logger.info('createAddress', { username, status: 'created' });
  return input;
};
