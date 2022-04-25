import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from 'chiba-clonk-client';

import { getConfig, getConnectionInfo } from '../../../util';

export const command = 'list';

export const desc = 'List bonds.';

export const builder = {
  owner: {
    type: 'string'
  }
}

export const handler = async (argv: Arguments) => {
  const { services: { cns: cnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const registry = new Registry(restEndpoint, gqlEndpoint, chainId);

  const { owner } = argv;
  const result = await registry.queryBonds({ owner });
  console.log(JSON.stringify(result, undefined, 2));
}
