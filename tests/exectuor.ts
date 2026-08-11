import { createYoga } from 'graphql-yoga';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { genSchema } from '../src/schema';
import plugins from '../src/envelop/index';

console.profile = jest.fn();
const schema = genSchema();

const yoga = createYoga({ schema, plugins });

export const executor = buildHTTPExecutor({
  fetch: yoga.fetch.bind(yoga),
  headers: (request) => {
    const extensionHeaders = (request as any).extensions?.headers;
    if (extensionHeaders != null) {
      return extensionHeaders as Record<string, string>;
    }
    return { client: 'test-client' };
  },
});
