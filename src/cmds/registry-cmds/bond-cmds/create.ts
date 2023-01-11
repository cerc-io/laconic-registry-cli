import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../util';

export const command = 'create';

export const desc = 'Create bond.';

export const builder = {
  type: {
    type: 'string'
  },
  quantity: {
    type: 'string'
  }
}

export const handler = async (argv: Arguments) => {
  const { config, verbose } = argv;
  const denom = argv.type as string;
  const amount = argv.quantity as string;

  assert(denom, 'Invalid Type.');
  assert(amount, 'Invalid Quantity.');

  const { services: { lns: lnsConfig } } = getConfig(config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, lnsConfig);
  assert(restEndpoint, 'Invalid Registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid Registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid Registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, lnsConfig);
  const result = await registry.createBond({ denom, amount }, privateKey, fee);
  console.log(verbose ? JSON.stringify(result, undefined, 2) : result.data);
}
