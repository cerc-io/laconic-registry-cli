import { Arguments } from 'yargs';
import assert from 'assert';
import path from 'path';
import { Registry } from '@cerc-io/laconic-sdk';
import fs from 'fs';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../../util';

export const command = 'reveal [auction-id] [file-path]';

export const desc = 'Reveal auction bid.';

export const handler = async (argv: Arguments) => {
  const auctionId = argv.auctionId as string;
  const filePath = argv.filePath as string;
  assert(auctionId, 'Invalid auction ID.');
  assert(filePath, 'Invalid reveal file path.');

  const { services: { lns: lnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, lnsConfig);
  assert(restEndpoint, 'Invalid Registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid Registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid Registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, lnsConfig);

  const reveal = fs.readFileSync(path.resolve(filePath));
  const result = await registry.revealBid({ auctionId, reveal: reveal.toString('hex') }, privateKey, fee);
  console.log(JSON.stringify(result, undefined, 2));
}
