import type { Plugin } from '@envelop/core';
import { GraphQLError } from 'graphql';
import { ContextType } from '../types';

export const requireClientHeader = (): Plugin<ContextType> => {
  return {
    onParse({ context, extendContext, params }) {
      const ctxAny: any = context as any;
      const req: any = ctxAny?.request || {};
      let client: string | undefined;

      if (req && req.headers) {
        const headers: any = req.headers;
        client = headers.get('client');
      }

      if (!client) {
        throw new GraphQLError('Missing required header: client');
      }

      extendContext({ client });
    },

    onExecute({ args, context }) {
      let operationType: string | undefined = undefined;
      if (args && (args as any).operation && (args as any).operation.operation) {
        operationType = (args as any).operation.operation;
      } else if ((args as any).document) {
        const def = (args as any).document.definitions?.find((d: any) => d.kind === 'OperationDefinition');
        operationType = def?.operation;
      }

      if (context.client === 'strata' && operationType === 'mutation') {
        throw new GraphQLError('Mutations are not allowed for client "strata"');
      }
    },
  };
};
