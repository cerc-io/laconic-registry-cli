import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../../util';

export const command = 'reassociate';

export const desc = 'Reassociate records with new bond.';

export const builder = {
  'old-bond-id': {
    type: 'string'
  },
  'new-bond-id': {
    type: 'string'
  }
}

export const handler = async (argv: Arguments) => {
  const oldBondId = argv.oldBondId as string;
  const newBondId = argv.newBondId as string;
  assert(oldBondId, 'Invalid Old Bond ID.');
  assert(newBondId, 'Invalid New Bond ID.');

  const { services: { lns: lnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, lnsConfig);
  assert(restEndpoint, 'Invalid Registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid Registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid Registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, lnsConfig);
  const result = await registry.reassociateRecords({ oldBondId, newBondId }, privateKey, fee);
  console.log(JSON.stringify(result, undefined, 2));
}
