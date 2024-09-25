import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { SpawnSyncReturns, spawnSync } from 'child_process';
import { Arguments } from 'yargs';

import { StdFee } from '@cosmjs/stargate';

import { getConfig, getGasAndFees } from '../src/util';

export const CHAIN_ID = 'laconic_9000-1';
export const TOKEN_TYPE = 'alnt';
export const CONFIG_FILE = 'config.yml';

export enum AUCTION_STATUS {
  COMMIT = 'commit',
  REVEAL = 'reveal',
  COMPLETED = 'completed'
}

export const AUCTION_FEES = {
  commit: 1000000,
  reveal: 1000000,
  minimumBid: 5000000
};
export const AUCTION_COMMIT_DURATION = 60; // 60s
export const AUCTION_REVEAL_DURATION = 60; // 60s

export function checkResultAndRetrieveOutput (result: SpawnSyncReturns<Buffer>): any {
  if (result.status !== 0) {
    console.log('stderr', result.stderr.toString().trim());
  }

  expect(result.status).toBe(0);

  const errorOutput = result.stderr.toString().trim();
  expect(errorOutput).toBe('');

  const output = result.stdout.toString().trim();
  expect(output.length).toBeGreaterThan(0);
  return JSON.parse(output);
}

export function createBond (quantity: number): { bondId: string } {
  const result = spawnSync('laconic', ['registry', 'bond', 'create', '--type', TOKEN_TYPE, '--quantity', quantity.toString(), '--gas', '200000', '--fees', `200000${TOKEN_TYPE}`]);
  const output = result.stdout.toString().trim();

  return JSON.parse(output);
}

export function getBondObj (params: { id: string, owner: string, balance: number}): any {
  return {
    id: params.id,
    owner: params.owner,
    balance: [
      {
        type: TOKEN_TYPE,
        quantity: params.balance
      }
    ]
  };
}

export function getAccountObj (params: { address: string, balance?: number }): any {
  const balanceObj: any = { type: TOKEN_TYPE };
  if (params.balance) {
    balanceObj.quantity = params.balance;
  }

  return {
    address: params.address,
    balance: [balanceObj]
  };
}

export function getRecordObj (recordFilePath: string, params: { bondId: string, recordId: string, names: any }): any {
  const recordContent = yaml.load(fs.readFileSync(recordFilePath, 'utf8')) as any;

  return {
    id: params.recordId,
    names: params.names,
    bondId: params.bondId,
    attributes: recordContent.record
  };
}

export function getAuthorityObj (params: { owner: string, status: string, auction: any, bondId?: string }): any {
  return {
    ownerAddress: params.owner,
    status: params.status,
    bondId: params.bondId || '',
    auction: params.auction
  };
}

export function getAuctionObj (params: { owner: string, status?: string }): any {
  return {
    status: params.status || 'commit',
    ownerAddress: params.owner,
    commitFee: {
      type: TOKEN_TYPE,
      quantity: AUCTION_FEES.commit
    },
    revealFee: {
      type: TOKEN_TYPE,
      quantity: AUCTION_FEES.reveal
    },
    minimumBid: {
      type: TOKEN_TYPE,
      quantity: AUCTION_FEES.minimumBid
    },
    winnerAddresses: [],
    winnerBids: []
  };
}

export function getBidObj (params: { bidder: string, status?: string }): any {
  return {
    bidderAddress: params.bidder,
    status: params.status || 'commit',
    commitFee: {
      type: TOKEN_TYPE,
      quantity: AUCTION_FEES.commit
    },
    revealFee: {
      type: TOKEN_TYPE,
      quantity: AUCTION_FEES.reveal
    },
    bidAmount: {
      type: '',
      quantity: 0
    }
  };
}

export async function delay (ms: number): Promise<any> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getFeesConfig (): number {
  const { services: { registry: registryConfig } } = getConfig(CONFIG_FILE);
  const fee = getGasAndFees({} as Arguments, registryConfig);
  return Number((fee as StdFee).amount[0].amount);
}

export function updateGasAndFeesConfig (gas?: string | null, fees?: string | null, gasPrice?: string | null): void {
  const config = getConfig(path.resolve(CONFIG_FILE));

  if (gas) {
    config.services.registry.gas = gas;
  } else if (gas === null) {
    delete config.services.registry.gas;
  }

  if (fees) {
    config.services.registry.fees = fees;
  } else if (fees === null) {
    delete config.services.registry.fees;
  }

  if (gasPrice) {
    config.services.registry.gasPrice = gasPrice;
  } else if (gasPrice === null) {
    delete config.services.registry.gasPrice;
  }

  try {
    fs.writeFileSync(CONFIG_FILE, yaml.dump(config), 'utf8');
  } catch (e) {
    console.error('Error writing config file:', e);
    throw e;
  }
}
