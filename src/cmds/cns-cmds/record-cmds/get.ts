import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo, queryOutput } from '../../../util';

export const command = 'get';

export const desc = 'Get record.';

export const handler = async (argv: Arguments) => {
  const { id, config } = argv;
  assert(id, 'Invalid Record ID.');

  const { services: { cns: cnsConfig } } = getConfig(config as string);
  const { restEndpoint, gqlEndpoint, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const result = await registry.getRecordsByIds([id as string]);

  queryOutput(result, argv.output);
};
