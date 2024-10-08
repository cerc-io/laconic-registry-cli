import { Arguments } from 'yargs';
import assert from 'assert';
import path from 'path';
import { Registry } from '@cerc-io/registry-sdk';
import fs from 'fs';

import { getConfig, getConnectionInfo, getGasAndFees, getGasPrice, txOutput } from '../../../../util';

export const command = 'reveal [auction-id] [file-path]';

export const desc = 'Reveal auction bid.';

export const handler = async (argv: Arguments) => {
  const auctionId = argv.auctionId as string;
  const filePath = argv.filePath as string;
  assert(auctionId, 'Invalid auction ID.');
  assert(filePath, 'Invalid reveal file path.');

  const { services: { registry: registryConfig } } = getConfig(argv.config as string);
  const { rpcEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, registryConfig);
  assert(rpcEndpoint, 'Invalid registry RPC endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid registry Chain ID.');

  const gasPrice = getGasPrice(argv, registryConfig);
  const registry = new Registry(gqlEndpoint, rpcEndpoint, { chainId, gasPrice });
  const fee = getGasAndFees(argv, registryConfig);

  const reveal = fs.readFileSync(path.resolve(filePath));
  const result = await registry.revealBid({ auctionId, reveal: reveal.toString('hex') }, privateKey, fee);
  const success = '{"success": true}';

  txOutput(result, success, argv.output, argv.verbose);
};
