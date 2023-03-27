import { Arguments } from 'yargs';
import assert from 'assert';
import { Registry } from '@cerc-io/laconic-sdk';

import { getConfig, getConnectionInfo, getGasAndFees,txOutput } from '../../../util';

export const command = 'cancel';

export const desc = 'Cancel bond.';

export const handler = async (argv: Arguments) => {
  const id = argv.id as string
  assert(id, 'Invalid Bond ID.');

  const { services: { cns: cnsConfig } } = getConfig(argv.config as string)
  const { restEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, cnsConfig);
  assert(restEndpoint, 'Invalid CNS REST endpoint.');
  assert(gqlEndpoint, 'Invalid CNS GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid CNS Chain ID.');

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, cnsConfig);
  const result = await registry.cancelBond({ id }, privateKey, fee);
  const success = `{"success":${result.code==0}}`
  txOutput(result,success,argv.output,argv.verbose)

}
