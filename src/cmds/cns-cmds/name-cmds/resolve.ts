import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from 'laconic-client';

import { getConfig, getConnectionInfo } from '../../../util';

export const command = 'resolve [name]';

export const desc = 'Resolve name to record.';

export const handler = async (argv: Arguments) => {
  const name = argv.name as string;
  assert(name, 'Invalid Name.');

  const { services: { cns: cnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const registry = new Registry(restEndpoint, gqlEndpoint, chainId);

  const result = await registry.resolveNames([name]);
  console.log(JSON.stringify(result, undefined, 4));
}
