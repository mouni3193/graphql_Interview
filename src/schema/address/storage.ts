import fs from 'fs/promises';
import path from 'path';
import { Addresses } from './types';

const ADDRESSES_PATH = path.join(__dirname, '../../../data/addresses.json');

export const readAddresses = async (): Promise<Addresses> => {
  const raw = await fs.readFile(ADDRESSES_PATH, 'utf8');
  return JSON.parse(raw) as Addresses;
};

export const writeAddresses = async (addresses: Addresses): Promise<void> => {
  const tmp = `${ADDRESSES_PATH}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(addresses, null, 2), 'utf8');
  await fs.rename(tmp, ADDRESSES_PATH);
};
