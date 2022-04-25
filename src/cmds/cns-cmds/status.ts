import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from 'chiba-clonk-client';

import { getConfig, getConnectionInfo } from '../../util';

export const command = 'status';

export const desc = 'Get CNS status.';

export const handler = async (argv: Arguments) => {
  const { services: { cns } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, chainId } = getConnectionInfo(argv, cns);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(chainId, 'Invalid CNS Chain ID.');

  console.log('parse argv', restEndpoint, gqlEndpoint, chainId)
  const registry = new Registry(restEndpoint, gqlEndpoint, chainId);

  // TODO: Implement getStatus method.
  // const result = await registry.getStatus();
  // console.log(JSON.stringify(result, undefined, 2));
}
