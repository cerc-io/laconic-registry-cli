import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../util';

export const command = 'associate';

export const desc = 'Associate record with bond.';

export const builder = {
  'bond-id': {
    type: 'string'
  }
}

export const handler = async (argv: Arguments) => {
  const id = argv.id as string;
  const bondId = argv.bondId as string;
  assert(id, 'Invalid Record ID.');
  assert(bondId, 'Invalid Bond ID.');

  const { services: { lns: lnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, lnsConfig);
  assert(restEndpoint, 'Invalid Registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid Registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid Registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, lnsConfig);
  const result = await registry.associateBond({ recordId: id, bondId }, privateKey, fee);
  console.log(JSON.stringify(result, undefined, 2));
}
