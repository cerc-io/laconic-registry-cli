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

  const { services: { cns: cnsConfig } } = getConfig(argv.config as string);
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const account = new Account(Buffer.from(privateKey, 'hex'));
  await account.init();
  const fromAddress = account.address;

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, cnsConfig);
  await registry.sendCoins({ denom, amount, destinationAddress }, privateKey, fee);
  const result = await registry.getAccounts([fromAddress, destinationAddress]);
  queryOutput(result, argv.output);
};
