import { Arguments } from 'yargs';
import assert from 'assert';
import { Account, Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../util';

export const command = 'send';

export const desc = 'Send tokens.';

export const builder = {
  type: {
    type: 'string'
  },
  quantity: {
    type: 'string'
  }
}

export const handler = async (argv: Arguments) => {
  const destinationAddress = argv.address as string;
  const denom = argv.type as string;
  const amount = argv.quantity as string;

  assert(destinationAddress, 'Invalid Address.');
  assert(denom, 'Invalid Type.');
  assert(amount, 'Invalid Quantity.');

  const { services: { lns: lnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, lnsConfig);
  assert(restEndpoint, 'Invalid Registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid Registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid Registry Chain ID.');

  const account = new Account(Buffer.from(privateKey, 'hex'));
  const fromAddress = account.formattedCosmosAddress;

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, lnsConfig);
  await registry.sendCoins({ denom, amount, destinationAddress }, privateKey, fee);
  const result = await registry.getAccounts([fromAddress, destinationAddress]);
  console.log(JSON.stringify(result, undefined, 2));
}
