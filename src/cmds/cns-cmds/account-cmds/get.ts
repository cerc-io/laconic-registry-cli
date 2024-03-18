import { Arguments } from 'yargs';
import assert from 'assert';
import { Account, Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, queryOutput } from '../../../util';

export const command = 'get';

export const desc = 'Get account.';

export const handler = async (argv: Arguments) => {
  let address = argv.address as string;

  const { services: { cns: cnsConfig } } = getConfig(argv.config as string);
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(chainId, 'Invalid CNS Chain ID.');

  if (!address && privateKey) {
    address = new Account(Buffer.from(privateKey, 'hex')).address;
  }

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const result = await registry.getAccounts([address]);

  queryOutput(result, argv.output);
};
