import { Arguments } from 'yargs';
import assert from 'assert';
import path from 'path';
import { Registry } from 'chiba-clonk-client';
import fs from 'fs';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../../util';

export const command = 'reveal [auction-id] [file-path]';

export const desc = 'Reveal auction bid.';

export const handler = async (argv: Arguments) => {
  const auctionId = argv.auctionId as string;
  const filePath = argv.filePath as string;
  assert(auctionId, 'Invalid auction ID.');
  assert(filePath, 'Invalid reveal file path.');

  const { services: { cns: cnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const registry = new Registry(restEndpoint, gqlEndpoint, chainId);
  const fee = getGasAndFees(argv, cnsConfig);

  const reveal = fs.readFileSync(path.resolve(filePath));
  const result = await registry.revealBid({ auctionId, reveal: reveal.toString('hex') }, privateKey, fee);
  console.log(JSON.stringify(result, undefined, 2));
}