import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, queryOutput } from '../../../util';

export const command = 'list';

export const desc = 'List bonds.';

export const builder = {
  owner: {
    type: 'string'
  }
};

export const handler = async (argv: Arguments) => {
  const { services: { registry: registryConfig } } = getConfig(argv.config as string);
  const { rpcEndpoint, gqlEndpoint, chainId } = getConnectionInfo(argv, registryConfig);
  assert(rpcEndpoint, 'Invalid registry RPC endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(chainId, 'Invalid registry Chain ID.');

  const registry = new Registry(gqlEndpoint, rpcEndpoint, { chainId });

  let result: any;

  const { owner } = argv;
  if (owner) {
    const [bondsByOwnerResult] = await registry.queryBondsByOwners([String(owner)]);
    result = bondsByOwnerResult.bonds;
  } else {
    result = await registry.queryBonds();
  }

  queryOutput(result, argv.output);
};
