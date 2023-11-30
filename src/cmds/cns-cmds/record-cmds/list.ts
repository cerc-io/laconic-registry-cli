import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo ,queryOutput} from '../../../util';

export const command = 'list';

export const desc = 'List records.';

export const builder = {
  'bond-id': {
    type: 'string'
  },
  owner: {
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
  const { services: { cns: cnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, chainId } = getConnectionInfo(argv, cnsConfig);
  const { type, name, bondId, owner, all } = argv;
  const filters: any = {};

  const filterArgs = argv._.slice(3);
  for (let i = 0; i < filterArgs.length-1; i+=2) {
    filters[String(filterArgs[i]).replace(/^-+/,"")] = filterArgs[i+1];
  }

  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);

  let result = await registry.queryRecords({...filters,  type, name}, all as boolean);

  // Apply ex post filters.
  if (bondId) {
    result = result.filter((v: any) => v.bondId === bondId);
  }

  if (owner) {
    result = result.filter((v: any) => v.owners?.find((e: string) => e === owner));
  }

  queryOutput(result, argv.output)
}
