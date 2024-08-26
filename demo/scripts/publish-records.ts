import yargs from 'yargs';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import assert from 'assert';
import { hideBin } from 'yargs/helpers';

import { StdFee } from '@cosmjs/stargate';
import { Registry } from '@cerc-io/registry-sdk';

import { getConfig, getGasAndFees, getConnectionInfo, txOutput } from '../../src/util';

enum RecordType {
  RepositoryRecord = 'RepositoryRecord',
  ServiceRecord = 'ServiceRecord',
  StackRecord = 'StackRecord',
  SubgraphRecord = 'SubgraphRecord',
  WatcherRecord = 'WatcherRecord',
  DockerImageRecord = 'DockerImageRecord'
}

const recordTypeToRecordField = new Map<string, string>([
  [RecordType.WatcherRecord, 'watcher'],
  [RecordType.SubgraphRecord, 'subgraph'],
  [RecordType.ServiceRecord, 'service']
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

  const dirHasRecords = await publishRecordsFromDir(directoryPath);
  if (dirHasRecords) {
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

async function publishRecordsFromDir (recordsDir: string): Promise<boolean> {
  // List record files
  const files = fs.readdirSync(recordsDir);
  const recordFiles = files.filter(file => ['.json', '.yaml', '.yml'].includes(path.extname(file).toLowerCase()));

  if (recordFiles.length === 0) {
    return false;
  }

  // Read record from each JSON file
  console.log('**************************************');
  console.log(`Publishing records from ${recordsDir}`);

  let recordType;
  for (let i = 0; i < recordFiles.length; i++) {
    const file = recordFiles[i];

    const filePath = path.resolve(recordsDir, file);
    const record = await readRecord(filePath);

    // Publish record
    const result = await publishRecord(userKey, bondId, fee, record);

    console.log(`Published record ${file}`);
    txOutput(result, JSON.stringify(result, undefined, 2), '', false);

    recordType = record.type;
  }

  // Check if deployment record files exist
  const deploymentRecordsDir = path.resolve(recordsDir, 'deployments');
  if (!fs.existsSync(deploymentRecordsDir) || !fs.statSync(deploymentRecordsDir).isDirectory()) {
    return true;
  }
  console.log('--------------------------------------');
  console.log(`Publishing deployment records from ${deploymentRecordsDir}`);

  // List record files
  const deploymentFiles = fs.readdirSync(deploymentRecordsDir);
  const deploymentJsonFiles = deploymentFiles.filter(file => path.extname(file).toLowerCase() === '.json');

  for (let i = 0; i < deploymentJsonFiles.length; i++) {
    const file = deploymentJsonFiles[i];

    const filePath = path.resolve(deploymentRecordsDir, file);
    const deploymentRecord = await readRecord(filePath);

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

  return true;
}

async function readRecord (filePath: string): Promise<any> {
  let record;
  try {
    const fileExt = path.extname(filePath).toLowerCase();
    const data = fs.readFileSync(filePath, 'utf8');

    if (fileExt === '.json') {
      // JSON file
      record = JSON.parse(data);
    } else {
      // YAML file
      ({ record } = await yaml.load(data) as any);

      // Convert sub-objects (other than arrays) to a JSON automatically.
      for (const [k, v] of Object.entries(record)) {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          record[k] = JSON.stringify(v);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err);
  }

  return record;
}

async function publishRecord (userKey: string, bondId: string, fee: StdFee, record: any): Promise<any> {
  // Replace repository URL with record id (if type is one of RecordType)
  if (record.repository && Object.values(RecordType).includes(record.type)) {
    const repoUrl = record.repository;

    const queryResult = await registry.queryRecords({ type: RecordType.RepositoryRecord, url: repoUrl }, true);
    if (queryResult.length === 0) {
      throw new Error(`Record not found, type: ${RecordType.RepositoryRecord}, url: ${repoUrl}`);
    }

    // Assume the first query result
    const repoRecordId = queryResult[0].id;

    // Replace repository URL with the repo record id
    record.repository = repoRecordId;
  }

  // For stack records, check for attributes
  if (record.type === RecordType.StackRecord) {
    const watcherName = record.meta?.watcher;
    const dockerImages = record.docker_images;

    // If .docker_images present, check for image records
    if (Array.isArray(dockerImages) && dockerImages.length > 0) {
      const dockerImageRecordsIdPromises = dockerImages.map(async (dockerImage) => {
        // Find the required docker image record
        const queryResult = await registry.queryRecords({ type: RecordType.DockerImageRecord, name: dockerImage }, true);
        if (queryResult.length === 0) {
          throw new Error(`Record not found, type: ${RecordType.DockerImageRecord}, name: ${dockerImage}`);
        }

        // Assume the first query result
        const dockerImageRecordId = queryResult[0].id;

        // Replace watcher name with the watcher record id
        return dockerImageRecordId;
      });

      record.docker_images = await Promise.all(dockerImageRecordsIdPromises);
    }

    // If .meta.watcher present, check for watcher record
    if (watcherName) {
      // Find the required watcher record
      const queryResult = await registry.queryRecords({ type: RecordType.WatcherRecord, name: watcherName }, true);
      if (queryResult.length === 0) {
        throw new Error(`Record not found, type: ${RecordType.WatcherRecord}, name: ${watcherName}`);
      }

      // Assume the first query result
      const watcherRecordId = queryResult[0].id;

      // Replace watcher name with the watcher record id
      record.meta.watcher = watcherRecordId;
    }
  }

  return registry.setRecord({ privateKey: userKey, record, bondId }, userKey, fee);
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
