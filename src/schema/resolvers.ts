import { getAddress, createAddress } from "./address/address";
import { Address, Args, AddressInput } from "./address/types";
import { ContextType } from "../types";

export const resolvers = {
  Query: {
    address: async (_: any, args: Args, context: ContextType): Promise<Address> => {
      return getAddress(_, args, context);
    },
  },
  Mutation: {
    createAddress: async (_: any, args: { username: string; input: AddressInput }, context: ContextType): Promise<Address> => {
      return createAddress(_, args, context);
    },
  },
};
