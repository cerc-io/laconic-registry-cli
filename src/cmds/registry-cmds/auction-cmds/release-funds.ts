import { Arguments } from 'yargs';
import assert from 'assert';

import { Account, Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, getGasAndFees, getGasPrice, txOutput } from '../../../util';

export const command = 'release-funds [auction-id]';

export const desc = 'Release funds of provider auction winners.';

export const handler = async (argv: Arguments) => {
  const auctionId = argv.auctionId as string;
  assert(auctionId, 'Invalid auction ID.');

  const { services: { registry: registryConfig } } = getConfig(argv.config as string);
  const { rpcEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, registryConfig);
  assert(rpcEndpoint, 'Invalid registry RPC endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid registry Chain ID.');

  const account = new Account(Buffer.from(privateKey, 'hex'));
  await account.init();

  const gasPrice = getGasPrice(argv, registryConfig);
  const registry = new Registry(gqlEndpoint, rpcEndpoint, { chainId, gasPrice });
  const fee = getGasAndFees(argv, registryConfig);

  const result = await registry.releaseFunds({ auctionId }, privateKey, fee);

  const success = '{"success": true}';
  txOutput(result, success, argv.output, argv.verbose);
};
