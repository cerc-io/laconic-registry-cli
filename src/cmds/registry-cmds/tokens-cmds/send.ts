import { Arguments } from 'yargs';
import assert from 'assert';

import { Account, Registry, DEFAULT_GAS_ESTIMATION_MULTIPLIER } from '@cerc-io/registry-sdk';
import { DeliverTxResponse } from '@cosmjs/stargate';

import { getConfig, getConnectionInfo, getGasAndFees, getGasPrice, queryOutput } from '../../../util';

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

  const gasPrice = getGasPrice(argv, registryConfig);
  const registry = new Registry(gqlEndpoint, rpcEndpoint, { chainId, gasPrice });
  const laconicClient = await registry.getLaconicClient(account);
  const fee = getGasAndFees(argv, registryConfig);

  const txResponse: DeliverTxResponse = await laconicClient.sendTokens(
    account.address,
    destinationAddress,
    [
      {
        denom,
        amount
      }
    ],
    fee || DEFAULT_GAS_ESTIMATION_MULTIPLIER);

  assert(txResponse.code === 0, `TX Failed - Hash: ${txResponse.transactionHash}, Code: ${txResponse.code}, Message: ${txResponse.rawLog}`);

  const transfer = txResponse.events.find(e => e.type === 'transfer' ? e.attributes.find(a => a.key === 'msg_index') : null);
  const accountResponse = await registry.getAccounts([fromAddress, destinationAddress]);

  const output = {
    tx: {
      hash: txResponse.transactionHash,
      height: txResponse.height,
      index: txResponse.txIndex,
      code: txResponse.code,
      log: txResponse.rawLog,
      sender: transfer?.attributes.find(a => a.key === 'sender')?.value,
      recipient: transfer?.attributes.find(a => a.key === 'recipient')?.value,
      amount: transfer?.attributes.find(a => a.key === 'amount')?.value
    },
    accounts: accountResponse
  };

  queryOutput(output, argv.output);
};
