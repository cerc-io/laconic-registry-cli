import { Arguments } from 'yargs';
import assert from 'assert';
import { Account, Registry } from '@cerc-io/registry-sdk';

import { getConfig, getConnectionInfo, queryOutput } from '../../../util';
import { IndexedTx } from '@cosmjs/stargate/build/stargateclient';

export const command = 'gettx';

export const desc = 'Get token transfer tx info.';

export const builder = {
  hash: {
    type: 'string'
  }
};

export const handler = async (argv: Arguments) => {
  const hash = argv.hash as string;

  assert(hash, 'Invalid tx hash.');

  const { services: { registry: registryConfig } } = getConfig(argv.config as string);
  const { rpcEndpoint, gqlEndpoint, privateKey, chainId } = getConnectionInfo(argv, registryConfig);
  assert(rpcEndpoint, 'Invalid registry RPC endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(privateKey, 'Invalid Transaction Key.');
  assert(chainId, 'Invalid registry Chain ID.');

  const account = new Account(Buffer.from(privateKey, 'hex'));
  await account.init();

  const registry = new Registry(gqlEndpoint, rpcEndpoint, chainId);
  const laconicClient = await registry.getLaconicClient(account);

  const txResponse: IndexedTx | null = await laconicClient.getTx(hash);
  if (txResponse) {
    const transfer = txResponse.events.find(e => e.type === 'transfer' ? e.attributes.find(a => a.key === 'msg_index') : null);
    const output = {
      hash: txResponse.hash,
      height: txResponse.height,
      index: txResponse.txIndex,
      code: txResponse.code,
      log: txResponse.rawLog,
      sender: transfer?.attributes.find(a => a.key === 'sender')?.value,
      recipient: transfer?.attributes.find(a => a.key === 'recipient')?.value,
      amount: transfer?.attributes.find(a => a.key === 'amount')?.value,
      raw: Buffer.from(txResponse.tx).toString('hex').toUpperCase()
    };
    queryOutput(output, argv.output);
  } else {
    queryOutput(null, argv.output);
  }
};
