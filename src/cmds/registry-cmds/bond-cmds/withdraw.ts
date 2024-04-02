import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, getGasAndFees, txOutput } from '../../../util';

export const command = 'withdraw';

export const desc = 'Withdraw funds from bond.';

export const builder = {
  type: {
    type: 'string'
  },
  quantity: {
    type: 'string'
  }
};

export const handler = async (argv: Arguments) => {
  const denom = argv.type as string;
  const amount = argv.quantity as string;
  const id = argv.id as string;

  assert(id, 'Invalid Bond ID.');
  assert(denom, 'Invalid Type.');
  assert(amount, 'Invalid Quantity.');

  const { services: { registry: registryConfig } } = getConfig(argv.config as string);
  const { rpcEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, registryConfig);
  assert(rpcEndpoint, 'Invalid registry RPC endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid registry Chain ID.');

  const registry = new Registry(gqlEndpoint, rpcEndpoint, chainId);
  const fee = getGasAndFees(argv, registryConfig);
  const result = await registry.withdrawBond({ id, denom, amount }, privateKey, fee);
  const success = '{"success": true}';
  txOutput(result, success, argv.output, argv.verbose);
};
