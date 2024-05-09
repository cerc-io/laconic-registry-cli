import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { hideBin } from 'yargs/helpers';

import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getGasAndFees, getConnectionInfo, txOutput } from '../../src/util';

const recordTypeToRecordField = new Map<string, string>([
  ['WatcherRecord', 'watcher'],
  ['SubgraphRecord', 'subgraph'],
  ['ServiceRecord', 'service']
]);

let registry: Registry;
let fee: any;
let userKey: string;
let bondId: string;

async function main () {
  const argv = getArgs();
  const { records: recordsDir, config } = argv;

  const { services: { registry: registryConfig } } = getConfig(config as string);

  if (registryConfig.userKey == null) {
    throw new Error('userKey not set in config');
  }

  if (registryConfig.bondId == null) {
    throw new Error('bondId not set in config');
  }

  let rpcEndpoint, gqlEndpoint, chainId: string;
  ({ rpcEndpoint, gqlEndpoint, userKey, bondId, chainId } = getConnectionInfo(argv, registryConfig));

  registry = new Registry(gqlEndpoint, rpcEndpoint, chainId);
  fee = getGasAndFees(argv, registryConfig);

  await processDir(path.resolve(recordsDir));
}

async function processDir (directoryPath: string): Promise<void> {
  const files = fs.readdirSync(directoryPath);

  // Check if any JSON record file exists in the directory
  if (files.some(file => file.endsWith('.json'))) {
    await publishRecordsFromDir(directoryPath);

    // Skip further recursion in the current dir
    return;
  }

  // Recursively iterate through subdirectories
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const filePath = path.join(directoryPath, file);

    if (fs.statSync(filePath).isDirectory()) {
      await processDir(filePath);
    }
  }
}

async function publishRecordsFromDir (recordsDir: string): Promise<void> {
  // List record files
  const files = fs.readdirSync(recordsDir);
  const jsonFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

  // Read record from each JSON file
  console.log('**************************************');
  console.log(`Publishing records from ${recordsDir}`);

  let recordType;
  for (let i = 0; i < jsonFiles.length; i++) {
    const file = jsonFiles[i];

    const filePath = path.resolve(recordsDir, file);
    const record = readRecord(filePath);

    // Publish record
    const result = await registry.setRecord({ privateKey: userKey, record, bondId }, userKey, fee);

    console.log(`Published record ${file}`);
    txOutput(result, JSON.stringify(result, undefined, 2), '', false);

    recordType = record.type;
  }

  // Check if deployment record files exist
  const deploymentRecordsDir = path.resolve(recordsDir, 'deployments');
  if (!fs.statSync(deploymentRecordsDir).isDirectory()) {
    return;
  }
  console.log('--------------------------------------');
  console.log(`Publishing deployment records from ${deploymentRecordsDir}`);

  // List record files
  const deploymentFiles = fs.readdirSync(deploymentRecordsDir);
  const deploymentJsonFiles = deploymentFiles.filter(file => path.extname(file).toLowerCase() === '.json');

  for (let i = 0; i < deploymentJsonFiles.length; i++) {
    const file = deploymentJsonFiles[i];

    const filePath = path.resolve(deploymentRecordsDir, file);
    const deploymentRecord = readRecord(filePath);

    // Find record using name and given type
    const recordName = deploymentRecord.name;
    assert(recordType, 'recordType could not be resolved');
    const queryResult = await registry.queryRecords({ type: recordType, name: recordName }, true);
    if (queryResult.length === 0) {
      throw new Error(`Record not found, type: ${recordType}, name: ${recordName}`);
    }

    // Assume the first query result
    const recordId = queryResult[0].id;

    // Set record field to record id
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    deploymentRecord[recordTypeToRecordField.get(recordType)!] = recordId;

    // Publish record
    const deploymentResult = await registry.setRecord({ privateKey: userKey, record: deploymentRecord, bondId }, userKey, fee);

    console.log(`Published record ${file}`);
    txOutput(deploymentResult, JSON.stringify(deploymentResult, undefined, 2), '', false);
  }
}

function readRecord (filePath: string): any {
  let record;
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    record = JSON.parse(data);
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
  }

  return record;
}

function getArgs (): any {
  return yargs(hideBin(process.argv)).parserConfiguration({
    'parse-numbers': false
  }).usage('Usage: $0 [options]')
    .option('config', {
      alias: 'c',
      describe: 'Config',
      type: 'string',
      demandOption: true
    })
    .option('records', {
      alias: 'r',
      describe: 'Records dir path',
      type: 'string',
      demandOption: true
    })
    .help().argv;
}

main()
  .catch(err => {
    console.error(err);
  })
  .finally(() => {
    console.log('Done');
  });
