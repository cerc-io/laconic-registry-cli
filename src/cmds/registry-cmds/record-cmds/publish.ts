import { Arguments } from 'yargs';
import assert from 'assert';
import yaml from 'js-yaml';
import fs from 'fs';
import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getGasAndFees, getConnectionInfo, txOutput } from '../../../util';

export const command = 'publish';

export const desc = 'Register record.';

export const builder = {
  'bond-id': {
    type: 'string'
  }
};

export const handler = async (argv: Arguments) => {
  const { txKey, filename, config } = argv;
  const { services: { registry: registryConfig } } = getConfig(config as string);
  const { restEndpoint, gqlEndpoint, userKey, bondId, chainId } = getConnectionInfo(argv, registryConfig);

  assert(restEndpoint, 'Invalid registry REST endpoint.');
  assert(gqlEndpoint, 'Invalid registry GQL endpoint.');
  assert(userKey, 'Invalid User Key.');
  assert(bondId, 'Invalid Bond ID.');
  assert(chainId, 'Invalid registry Chain ID.');

  let file = null;
  if (filename) {
    file = filename as string;
  } else {
    file = 0; // stdin
  }

  const { record } = await yaml.load(fs.readFileSync(file, 'utf-8')) as any;

  // Convert sub-objects (other than arrays) to a JSON automatically.
  for (const [k, v] of Object.entries(record)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      record[k] = JSON.stringify(v);
    }
  }

  const registry = new Registry(gqlEndpoint, restEndpoint, chainId);
  const fee = getGasAndFees(argv, registryConfig);
  const result = await registry.setRecord({ privateKey: userKey, record, bondId }, txKey || userKey, fee);

  txOutput(result, JSON.stringify(result, undefined, 2), argv.output, argv.verbose);
};
