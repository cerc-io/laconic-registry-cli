import { Arguments } from 'yargs';
import assert from 'assert';
import path from 'path';
import { Account, createBid, Registry } from '@cerc-io/registry-sdk';
import { ensureDir } from 'fs-extra';
import fs from 'fs';

import { getConfig, getConnectionInfo, getGasAndFees, txOutput } from '../../../../util';

const OUT_DIR = 'out';

export const command = 'commit [auction-id] [quantity] [type]';

export const desc = 'Commit auction bid.';

export const handler = async (argv: Arguments) => {
  const auctionId = argv.auctionId as string;
  const quantity = argv.quantity as string;
  const denom = argv.type as string;
  assert(auctionId, 'Invalid auction ID.');
  assert(quantity, 'Invalid token quantity.');
  assert(denom, 'Invalid token type.');

  const { services: { registry: registryConfig } } = getConfig(argv.config as string);
  const { rpcEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, registryConfig);
  assert(rpcEndpoint, 'Invalid registry RPC endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid registry Chain ID.');

  const account = new Account(Buffer.from(privateKey, 'hex'));
  await account.init();
  const bidderAddress = account.address;
  const bidAmount = `${quantity}${denom}`;
  const { reveal, commitHash } = await createBid(chainId, auctionId, bidderAddress, bidAmount);

  // Save reveal file.
  const outDirPath = path.join(process.cwd(), OUT_DIR);
  const revealFilePath = path.join(outDirPath, `${commitHash}.json`);
  await ensureDir(outDirPath);
  fs.writeFileSync(revealFilePath, JSON.stringify(reveal, undefined, 2));

  const registry = new Registry(gqlEndpoint, rpcEndpoint, chainId);
  const fee = getGasAndFees(argv, registryConfig);

  const result = await registry.commitBid({ auctionId, commitHash }, privateKey, fee);
  const revealFile = `{"reveal_file":"${revealFilePath}"}`;

  txOutput(result, revealFile, argv.output, argv.verbose);
};
