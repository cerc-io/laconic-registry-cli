import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../../util';

export const command = 'dissociate';

export const desc = 'Dissociate all records from bond.';

export const builder = {
  'bond-id': {
    type: 'string'
  }
}

export const handler = async (argv: Arguments) => {
  const bondId = argv.bondId as string;
  assert(bondId, 'Invalid Bond ID.');

  const { services: { cns: cnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, cnsConfig);
  const result = await registry.dissociateRecords({ bondId }, privateKey, fee);
  const success = `{"success":${result.code==0}}`
  if (argv.output=="json"){
    console.log(argv.verbose ? JSON.stringify(result, undefined, 2) : JSON.stringify(JSON.parse(success)));
  } else {
    console.log(argv.verbose ? result : success);
  }
}
