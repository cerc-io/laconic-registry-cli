import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, queryOutput } from '../../../util';

export const command = 'get';

export const desc = 'Get bond.';

export const handler = async (argv: Arguments) => {
  const { id, config } = argv;
  console.assert(id, 'Bond Id is required.');

  const { services: { registry: registryConfig } } = getConfig(config as string);
  const { rpcEndpoint, gqlEndpoint, chainId } = getConnectionInfo(argv, registryConfig);
  assert(rpcEndpoint, 'Invalid registry RPC endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(chainId, 'Invalid registry Chain ID.');

  const registry = new Registry(gqlEndpoint, rpcEndpoint, chainId);

  const result = await registry.getBondsByIds([id as string]);

  queryOutput(result, argv.output);
};
