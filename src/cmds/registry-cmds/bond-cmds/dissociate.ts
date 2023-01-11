import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../util';

export const command = 'dissociate';

export const desc = 'Dissociate record from bond.';

export const handler = async (argv: Arguments) => {
  const id = argv.id as string;
  assert(id, 'Invalid Record ID.');

  const { services: { lns: lnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, lnsConfig);
  assert(restEndpoint, 'Invalid Registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid Registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid Registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, lnsConfig);
  const result = await registry.dissociateBond({ recordId: id }, privateKey, fee);
  console.log(JSON.stringify(result, undefined, 2));
}
