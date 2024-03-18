import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, getGasAndFees, txOutput } from '../../../../util';

export const command = 'reassociate';

export const desc = 'Reassociate records with new bond.';

export const builder = {
  'old-bond-id': {
    type: 'string'
  },
  'new-bond-id': {
    type: 'string'
  }
};

export const handler = async (argv: Arguments) => {
  const oldBondId = argv.oldBondId as string;
  const newBondId = argv.newBondId as string;
  assert(oldBondId, 'Invalid Old Bond ID.');
  assert(newBondId, 'Invalid New Bond ID.');

  const { services: { cns: cnsConfig } } = getConfig(argv.config as string);
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, cnsConfig);
  const result = await registry.reassociateRecords({ oldBondId, newBondId }, privateKey, fee);
  const success = '{"success": true}';
  txOutput(result, success, argv.output, argv.verbose);
};
