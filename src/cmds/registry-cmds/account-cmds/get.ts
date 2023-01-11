import { Arguments } from 'yargs';
import assert from 'assert';
import { Account, Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo } from '../../../util';

export const command = 'get';

export const desc = 'Get account.';

export const handler = async (argv: Arguments) => {
  let address = argv.address as string;

  const { services: { lns: lnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, lnsConfig);
  assert(restEndpoint, 'Invalid Registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid Registry GQL endpoint.');
  assert(chainId, 'Invalid Registry Chain ID.');

  if (!address && privateKey) {
    address = new Account(Buffer.from(privateKey, 'hex')).getCosmosAddress();
  }

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const result = await registry.getAccounts([address]);

  console.log(JSON.stringify(result, undefined, 2));
}
