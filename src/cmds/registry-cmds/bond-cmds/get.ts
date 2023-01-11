import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo } from '../../../util';

export const command = 'get';

export const desc = 'Get bond.';

export const handler = async (argv: Arguments) => {
  const { id, config } = argv;
  console.assert(id, 'Bond Id is required.');

  const { services: { lns: lnsConfig } } = getConfig(config as string)
  const { restEndpoint, gqlEndpoint, chainId } = getConnectionInfo(argv, lnsConfig);
  assert(restEndpoint, 'Invalid Registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid Registry GQL endpoint.');
  assert(chainId, 'Invalid Registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);

  const result = await registry.getBondsByIds([id as string]);
  console.log(JSON.stringify(result, undefined, 2));
}
