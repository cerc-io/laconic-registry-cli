import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from 'chiba-clonk-client';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../../util';

export const command = 'set [name] [bond-id]';

export const desc = 'Set bond for authority.';

export const handler = async (argv: Arguments) => {
  const name = argv.name as string;
  const bondId = argv.bondId as string;
  assert(name, 'Invalid authority name.');

  const { services: { cns: cnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const registry = new Registry(restEndpoint, gqlEndpoint, chainId);
  const fee = getGasAndFees(argv, cnsConfig);
  const result = await registry.setAuthorityBond({ name, bondId }, privateKey, fee);
  console.log(JSON.stringify(result, undefined, 2));
}