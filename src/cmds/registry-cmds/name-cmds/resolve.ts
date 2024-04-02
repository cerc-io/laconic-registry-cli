import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, queryOutput } from '../../../util';

export const command = 'resolve [name]';

export const desc = 'Resolve name to record.';

export const handler = async (argv: Arguments) => {
  const name = argv.name as string;
  assert(name, 'Invalid Name.');

  const { services: { registry: registryConfig } } = getConfig(argv.config as string);
  const { rpcEndpoint, gqlEndpoint, chainId } = getConnectionInfo(argv, registryConfig);
  assert(rpcEndpoint, 'Invalid registry RPC endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(chainId, 'Invalid registry Chain ID.');

  const registry = new Registry(gqlEndpoint, rpcEndpoint, chainId);

  let result = await registry.resolveNames([name]);
  result = result.filter((v: any) => v);

  queryOutput(result, argv.output);
};
