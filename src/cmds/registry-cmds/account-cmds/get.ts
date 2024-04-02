import { Arguments } from 'yargs';
import assert from 'assert';
import { Account, Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, queryOutput } from '../../../util';

export const command = 'get';

export const desc = 'Get account.';

export const handler = async (argv: Arguments) => {
  let address = argv.address as string;

  const { services: { registry: registryConfig } } = getConfig(argv.config as string);
  const { rpcEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, registryConfig);
  assert(rpcEndpoint, 'Invalid registry RPC endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(chainId, 'Invalid registry Chain ID.');

  if (!address && privateKey) {
    address = new Account(Buffer.from(privateKey, 'hex')).address;
  }

  const registry = new Registry(gqlEndpoint, rpcEndpoint, chainId);
  const result = await registry.getAccounts([address]);

  queryOutput(result, argv.output);
};
