import type { Plugin } from '@envelop/core';
import { v4 as uuid } from 'uuid';
import { ContextType } from '../types';

export const buildHeaders = (): Plugin<ContextType> => {
  return {
    onParse({ extendContext }) {
      const requestId = uuid();
      extendContext({ requestId });
    },

    onExecute({ args }) {
      return {
        onExecuteDone({ result, setResult }: any) {
          if (!result || typeof result !== 'object' || typeof setResult !== 'function') {
            return;
          }

          if (typeof (result as any).then === 'function') {
            return;
          }

          setResult({
            ...result,
            metadata: {
              requestId: args.contextValue.requestId,
            },
          });
        },
      };
    },
  };
};
