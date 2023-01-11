import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo } from '../../../util';

export const command = 'list';

export const desc = 'List records.';

export const builder = {
  'bond-id': {
    type: 'string'
  },
  type: {
    type: 'string'
  },
  name: {
    type: 'string'
  },
  all: {
    type: 'boolean',
    default: false
  }
}

export const handler = async (argv: Arguments) => {
  const { services: { lns: lnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, chainId } = getConnectionInfo(argv, lnsConfig);
  const { type, name, bondId, all } = argv;

  assert(restEndpoint, 'Invalid Registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid Registry GQL endpoint.');
  assert(chainId, 'Invalid Registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);

  const result = await registry.queryRecords({ bondId, type, name }, all as boolean);
  console.log(JSON.stringify(result, undefined, 2));
}
