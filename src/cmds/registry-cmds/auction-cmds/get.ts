import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, queryOutput } from '../../../util';

export const command = 'get [id]';

export const desc = 'Get auction information.';

export const handler = async (argv: Arguments) => {
  const { id, config } = argv;
  assert(id, 'Invalid auction ID.');

  const { services: { registry: registryConfig } } = getConfig(config as string);
  const { restEndpoint, gqlEndpoint, chainId } = getConnectionInfo(argv, registryConfig);
  assert(restEndpoint, 'Invalid registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(chainId, 'Invalid registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const result = await registry.getAuctionsByIds([id as string]);

  queryOutput(result, argv.output);
};
