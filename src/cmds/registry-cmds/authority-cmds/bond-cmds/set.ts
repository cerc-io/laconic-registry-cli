import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, getGasAndFees, txOutput } from '../../../../util';

export const command = 'set [name] [bond-id]';

export const desc = 'Set bond for authority.';

export const handler = async (argv: Arguments) => {
  const name = argv.name as string;
  const bondId = argv.bondId as string;
  assert(name, 'Invalid authority name.');
  assert(bondId, 'Invalid Bond ID.');

  const { services: { registry: registryConfig } } = getConfig(argv.config as string);
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, registryConfig);
  assert(restEndpoint, 'Invalid registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, registryConfig);
  const result = await registry.setAuthorityBond({ name, bondId }, privateKey, fee);
  const success = '{"success": true}';

  txOutput(result, success, argv.output, argv.verbose);
};
