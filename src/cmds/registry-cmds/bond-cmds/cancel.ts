import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, getGasAndFees, txOutput } from '../../../util';

export const command = 'cancel';

export const desc = 'Cancel bond.';

export const handler = async (argv: Arguments) => {
  const id = argv.id as string;
  assert(id, 'Invalid Bond ID.');

  const { services: { registry: registryConfig } } = getConfig(argv.config as string);
  const { rpcEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, registryConfig);
  assert(rpcEndpoint, 'Invalid registry RPC endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid registry Chain ID.');

  const registry = new Registry(gqlEndpoint, rpcEndpoint, chainId);
  const fee = getGasAndFees(argv, registryConfig);
  const result = await registry.cancelBond({ id }, privateKey, fee);
  const success = '{"success": true}';
  txOutput(result, success, argv.output, argv.verbose);
};
