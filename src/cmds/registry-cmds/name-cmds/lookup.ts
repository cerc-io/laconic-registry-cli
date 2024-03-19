import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, queryOutput } from '../../../util';

export const command = 'lookup [name]';

export const desc = 'Lookup name information.';

export const builder = {
  history: {
    type: 'boolean'
  }
};

export const handler = async (argv: Arguments) => {
  const name = argv.name as string;
  assert(name, 'Invalid Name.');

  const { services: { registry: registryConfig } } = getConfig(argv.config as string);
  const { restEndpoint, gqlEndpoint, chainId } = getConnectionInfo(argv, registryConfig);
  assert(restEndpoint, 'Invalid registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(chainId, 'Invalid registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const result = await registry.lookupNames([name], argv.history as boolean);

  queryOutput(result, argv.output);
};
