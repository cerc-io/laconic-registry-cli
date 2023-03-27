import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../util';
import { isNil } from 'lodash';

export const command = 'refill';

export const desc = 'Refill bond.';

export const builder = {
  type: {
    type: 'string'
  },
  quantity: {
    type: 'string'
  }
}

export const handler = async (argv: Arguments) => {
  const denom = argv.type as string;
  const amount = argv.quantity as string;
  const id = argv.id as string

  assert(id, 'Invalid Bond ID.');
  assert(denom, 'Invalid Type.');
  assert(amount, 'Invalid Quantity.');

  const { services: { cns: cnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, cnsConfig);
  const result = await registry.refillBond({ id, denom, amount }, privateKey, fee);
  const success = `{"success":${result.code==0}}`
  if (argv.output=="json"){
    console.log(argv.verbose ? JSON.stringify(result, undefined, 2) : JSON.stringify(JSON.parse(success)));
  } else {
    console.log(argv.verbose ? result : success);
  }
}
