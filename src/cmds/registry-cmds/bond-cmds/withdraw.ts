import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../util';

export const command = 'withdraw';

export const desc = 'Withdraw funds from bond.';

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
  assert(restEndpoint, 'Invalid Registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid Registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid Registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, cnsConfig);
  const result = await registry.withdrawBond({ id, denom, amount }, privateKey, fee);
  console.log(JSON.stringify(result, undefined, 2));
}
