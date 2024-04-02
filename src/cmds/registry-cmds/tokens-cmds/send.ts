import { Arguments } from 'yargs';
import assert from 'assert';
import { Account, Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, getGasAndFees, queryOutput } from '../../../util';

export const command = 'send';

export const desc = 'Send tokens.';

export const builder = {
  type: {
    type: 'string'
  },
  quantity: {
    type: 'string'
  }
};

export const handler = async (argv: Arguments) => {
  const destinationAddress = argv.address as string;
  const denom = argv.type as string;
  const amount = argv.quantity as string;

  assert(destinationAddress, 'Invalid Address.');
  assert(denom, 'Invalid Type.');
  assert(amount, 'Invalid Quantity.');

  const { services: { registry: registryConfig } } = getConfig(argv.config as string);
  const { rpcEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, registryConfig);
  assert(rpcEndpoint, 'Invalid registry RPC endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid registry Chain ID.');

  const account = new Account(Buffer.from(privateKey, 'hex'));
  await account.init();
  const fromAddress = account.address;

  const registry = new Registry(gqlEndpoint, rpcEndpoint, chainId);
  const fee = getGasAndFees(argv, registryConfig);
  await registry.sendCoins({ denom, amount, destinationAddress }, privateKey, fee);
  const result = await registry.getAccounts([fromAddress, destinationAddress]);
  queryOutput(result, argv.output);
};
