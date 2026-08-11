import type { Plugin } from '@envelop/core';
import { Logger } from '../logger';
import { ContextType } from '../types';

export const useLogger = (): Plugin<ContextType> => {
  return {
    onParse({ context, extendContext }) {
      const logger = new Logger();
      if (context.requestId) {
        logger.setRequestId(context.requestId);
      }
      if (context.client) {
        logger.setClient(context.client);
      }
      extendContext({ logger });
    },
  };
};
