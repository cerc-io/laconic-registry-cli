import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from 'laconic-sdk';

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

  const { services: { cns: cnsConfig } } = getConfig(config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const registry = new Registry(restEndpoint, gqlEndpoint, chainId);
  const fee = getGasAndFees(argv, cnsConfig);
  const result = await registry.createBond({ denom, amount }, privateKey, fee);
  console.log(verbose ? JSON.stringify(result, undefined, 2) : result.data);
}
