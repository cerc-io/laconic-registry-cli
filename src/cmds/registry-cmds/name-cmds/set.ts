import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo, getGasAndFees } from '../../../util';

export const command = 'set [name] [id]';

export const desc = 'Set name (create name to record ID mapping).';

export const handler = async (argv: Arguments) => {
  const name = argv.name as string;
  const id = argv.id as string;
  assert(name, 'Invalid Name.');
  assert(id, 'Invalid Record ID.');

  const { services: { cns: cnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid Registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid Registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid Registry Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, cnsConfig);
  const result = await registry.setName({ crn: name, cid: id }, privateKey, fee);

  console.log(JSON.stringify(result, undefined, 2));
}
