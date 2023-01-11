import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo } from '../../../util';

export const command = 'whois [name]';

export const desc = 'Lookup authority information.';

export const handler = async (argv: Arguments) => {
  const name = argv.name as string;
  assert(name, 'Invalid authority name.');

  const { services: { cns: cnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid Registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid Registry GQL endpoint.');
  assert(chainId, 'Invalid Registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const result = await registry.lookupAuthorities([name], true);

  console.log(JSON.stringify(result, undefined, 2));
}
