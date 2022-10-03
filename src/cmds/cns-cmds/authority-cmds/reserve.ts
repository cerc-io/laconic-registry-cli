import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from 'laconic-client';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../util';

export const command = 'reserve [name]';

export const desc = 'Reserve authority/name.';

export const builder = {
  owner: {
    type: 'string',
    default: ''
  }
}

export const handler = async (argv: Arguments) => {
  const name = argv.name as string;
  const owner = argv.owner as string;
  assert(name, 'Invalid authority name.');

  const { services: { cns: cnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const registry = new Registry(restEndpoint, gqlEndpoint, chainId);
  const fee = getGasAndFees(argv, cnsConfig);
  const result = await registry.reserveAuthority({ name, owner }, privateKey, fee);

  console.log(JSON.stringify(result, undefined, 2));
}
