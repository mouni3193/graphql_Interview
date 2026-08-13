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
          const requestId = ctxAny.requestId;
          if (ctxAny.logger && typeof ctxAny.logger.error === 'function') {
            ctxAny.logger.error('Missing required header: client', { requestId });
          }
          const extensions: any = requestId ? { metadata: { requestId } } : undefined;
          throw new GraphQLError('Missing required header: client', { extensions });
        }

        extendContext({ client });
        if (ctxAny.logger && typeof ctxAny.logger.setClient === 'function') {
          ctxAny.logger.setClient(client);
        }
        // parse-time handling only validates presence of client and sets context
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
        const requestId = (args && (args as any).contextValue && (args as any).contextValue.requestId) || (context as any).requestId;
        const ctxAny: any = context as any;
        if (ctxAny.logger && typeof ctxAny.logger.error === 'function') {
          ctxAny.logger.error('Mutations are not allowed for client "strata"', { requestId });
        }
        const extensions: any = requestId ? { metadata: { requestId } } : undefined;
        throw new GraphQLError('Mutations are not allowed for client "strata"', { extensions });
      }
    },
  };
};
