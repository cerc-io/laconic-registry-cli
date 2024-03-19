import fs from 'fs';
import yaml from 'js-yaml';
import { SpawnSyncReturns, spawnSync } from 'child_process';

export const CHAIN_ID = 'laconic_9000-1';
export const TOKEN_TYPE = 'photon';

export const AUCTION_FEES = {
  commit: 1000000,
  reveal: 1000000,
  minimumBid: 5000000
};
export const AUCTION_COMMIT_DURATION = 60; // 60s
export const AUCTION_REVEAL_DURATION = 60; // 60s

export function checkResultAndRetrieveOutput (result: SpawnSyncReturns<Buffer>): any {
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
    winnerAddress: ''
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
