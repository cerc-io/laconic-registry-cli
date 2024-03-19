import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, getGasAndFees, txOutput } from '../../../util';

export const command = 'associate';

export const desc = 'Associate record with bond.';

export const builder = {
  'bond-id': {
    type: 'string'
  }
};

export const handler = async (argv: Arguments) => {
  const id = argv.id as string;
  const bondId = argv.bondId as string;
  assert(id, 'Invalid Record ID.');
  assert(bondId, 'Invalid Bond ID.');

  const { services: { registry: registryConfig } } = getConfig(argv.config as string);
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, registryConfig);
  assert(restEndpoint, 'Invalid registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, registryConfig);
  const result = await registry.associateBond({ recordId: id, bondId }, privateKey, fee);
  const success = '{"success": true}';
  txOutput(result, success, argv.output, argv.verbose);
};
