import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from 'chiba-clonk-client';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../util';

export const command = 'dissociate';

export const desc = 'Dissociate record from bond.';

export const handler = async (argv: Arguments) => {
  const id = argv.id as string;
  assert(id, 'Invalid Record ID.');

  const { services: { cns: cnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const registry = new Registry(restEndpoint, gqlEndpoint, chainId);
  const fee = getGasAndFees(argv, cnsConfig);
  const result = await registry.dissociateBond({ recordId: id }, privateKey, fee);
  console.log(JSON.stringify(result, undefined, 2));
}
