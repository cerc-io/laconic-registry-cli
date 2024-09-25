import { Arguments } from 'yargs';
import assert from 'assert';

import { AUCTION_KIND_PROVIDER, AUCTION_KIND_VICKREY, Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, getGasAndFees, getGasPrice, txOutput } from '../../../util';

export const command = 'create';

export const desc = 'Create auction.';

export const builder = {
  kind: {
    type: 'string',
    describe: 'Auction kind (vickrey | provider)'
  },
  'commits-duration': {
    type: 'string',
    describe: 'Duration for bid commit phase in seconds'
  },
  'reveals-duration': {
    type: 'string',
    describe: 'Duration for bid reveal phase in seconds'
  },
  denom: {
    type: 'string',
    describe: 'Denom to use'
  },
  'commit-fee': {
    type: 'string',
    describe: 'Fee for committing a bid to the auction'
  },
  'reveal-fee': {
    type: 'string',
    describe: 'Fee for revealing a bid in the auction'
  },
  'minimum-bid': {
    type: 'string',
    default: 0,
    describe: 'Minimum bid amount (only for vickrey auction)'
  },
  'max-price': {
    type: 'string',
    default: 0,
    describe: 'Max acceptable bid price (only for provider auction)'
  },
  'num-providers': {
    type: 'number',
    describe: 'Number ofdesired providers (only for provider auction)'
  }
};

export const handler = async (argv: Arguments) => {
  const { config } = argv;

  const kind = argv.kind as string;
  const validAuctionKinds = [AUCTION_KIND_VICKREY, AUCTION_KIND_PROVIDER];
  assert(validAuctionKinds.includes(kind), `Invalid auction kind, has to be one of ${validAuctionKinds}.`);

  if (kind === AUCTION_KIND_VICKREY) {
    assert(argv.minimumBid, 'Invalid minimum bid.');
    assert(!argv.maxPrice, `Max price can only be used with ${AUCTION_KIND_PROVIDER} auction.`);
    assert(!argv.numProviders, `Num providers can only be used with ${AUCTION_KIND_PROVIDER} auction.`);
  } else if (kind === AUCTION_KIND_PROVIDER) {
    assert(argv.maxPrice, 'Invalid max price.');
    assert(argv.numProviders, 'Invalid num providers.');
    assert(!argv.minimumBid, `Minimum bid can only be used with ${AUCTION_KIND_VICKREY} auction.`);
  }

  assert(argv.commitsDuration, 'Invalid commits duration.');
  assert(argv.revealsDuration, 'Invalid reveals duration.');
  assert(argv.commitFee, 'Invalid commit fee.');
  assert(argv.revealFee, 'Invalid reveal fee.');

  const commitsDuration = argv.commitsDuration as string;
  const revealsDuration = argv.revealsDuration as string;

  const denom = argv.denom as string;
  const commitFee = argv.commitFee as string;
  const revealFee = argv.revealFee as string;
  const minimumBid = argv.minimumBid as string;
  const maxPrice = argv.maxPrice as string;
  const numProviders = argv.numProviders as number;

  const { services: { registry: registryConfig } } = getConfig(config as string);
  const { rpcEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, registryConfig);
  assert(rpcEndpoint, 'Invalid registry RPC endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid registry Chain ID.');

  const gasPrice = getGasPrice(argv, registryConfig);
  const registry = new Registry(gqlEndpoint, rpcEndpoint, { chainId, gasPrice });

  const fee = getGasAndFees(argv, registryConfig);

  let result: any;
  if (kind === AUCTION_KIND_VICKREY) {
    result = await registry.createAuction({ commitsDuration, revealsDuration, denom, commitFee, revealFee, minimumBid }, privateKey, fee);
  } else {
    result = await registry.createProviderAuction({ commitsDuration, revealsDuration, denom, commitFee, revealFee, maxPrice, numProviders }, privateKey, fee);
  }

  const jsonString = `{"auctionId":"${result.auction?.id}"}`;
  txOutput(result, jsonString, argv.output, argv.verbose);
};
