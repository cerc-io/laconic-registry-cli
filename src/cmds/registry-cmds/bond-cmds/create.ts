import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, getGasAndFees, txOutput } from '../../../util';

export const command = 'create';

export const desc = 'Create bond.';

export const builder = {
  type: {
    type: 'string'
  },
  quantity: {
    type: 'string'
  }
};

export const handler = async (argv: Arguments) => {
  const { config } = argv;
  const denom = argv.type as string;
  const amount = argv.quantity as string;

  assert(denom, 'Invalid Type.');
  assert(amount, 'Invalid Quantity.');

  const { services: { registry: registryConfig } } = getConfig(config as string);
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, registryConfig);
  assert(restEndpoint, 'Invalid registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, registryConfig);
  const bondId = await registry.getNextBondId(privateKey);
  const result = await registry.createBond({ denom, amount }, privateKey, fee);
  const jsonString = `{"bondId":"${bondId}"}`;

  txOutput(result, jsonString, argv.output, argv.verbose);
};
