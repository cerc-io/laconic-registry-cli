import fs from 'fs';
import assert from 'assert';
import { spawnSync } from 'child_process';

import { AUCTION_KIND_PROVIDER, AUCTION_KIND_VICKREY } from '@cerc-io/registry-sdk';

import {
  CHAIN_ID,
  TOKEN_TYPE,
  AUCTION_COMMIT_DURATION,
  AUCTION_REVEAL_DURATION,
  delay,
  checkResultAndRetrieveOutput,
  createBond,
  getBondObj,
  getAccountObj,
  getRecordObj,
  getAuthorityObj,
  getAuctionObj,
  getBidObj,
  updateGasAndFeesConfig,
  AUCTION_STATUS
} from './helpers';

describe('Test laconic CLI commands', () => {
  test('laconic', async () => {
    const result = spawnSync('laconic');
    expect(result.status).toBe(1);

    const output = result.stdout.toString().trim();
    const errorOutput = result.stderr.toString().trim();

    // Expect error with usage string
    expect(output).toBe('');
    expect(errorOutput).toContain('laconic <command>');
  });

  test('laconic registry', async () => {
    const result = spawnSync('laconic', ['registry']);
    expect(result.status).toBe(1);

    const output = result.stdout.toString().trim();
    const errorOutput = result.stderr.toString().trim();

    // Expect error with usage string
    expect(output).toBe('');
    expect(errorOutput).toContain('laconic registry');
    expect(errorOutput).toContain('Registry tools');
    expect(errorOutput).toContain('Commands:');
  });

  // TODO: Break up tests into separate files
  // TODO: Add tests for registry commands with all available flags

  describe('laconic registry commands', () => {
    const testAccount = process.env.TEST_ACCOUNT;
    assert(testAccount, 'TEST_ACCOUNT not set in env');
    const testAccount2 = 'laconic1pmuxrcnuhhf8qdllzuf2ctj2tnwwcg6yswqnyd';
    const initialAccountBalance = Number('1000000000000000000000000000000');

    const testAuthorityName = 'laconic';
    const testRecordFilePath = 'test/data/watcher-record.yml';
    let testAuctionId: string, testRecordId: string, testRecordBondId: string;

    test('laconic registry status', async () => {
      const result = spawnSync('laconic', ['registry', 'status']);
      const outputObj = checkResultAndRetrieveOutput(result);

      // Expect output object to have registry status props
      expect(outputObj).toHaveProperty('version');
      expect(outputObj).toHaveProperty('node');
      expect(outputObj).toHaveProperty('node.network', CHAIN_ID);
      expect(outputObj).toHaveProperty('sync');
      expect(Number(outputObj.sync.latestBlockHeight)).toBeGreaterThan(0);
      expect(outputObj).toHaveProperty('validator');
      expect(outputObj).toHaveProperty('validators');
      expect(outputObj).toHaveProperty('numPeers');
      expect(outputObj).toHaveProperty('peers');
      expect(outputObj).toHaveProperty('diskUsage');
    });

    describe('Bond operations', () => {
      const bondOwner = testAccount;
      let bondBalance = 1000000000;
      let bondId: string;

      test('laconic registry bond create --type <type> --quantity <quantity> --gas <gas> --fees <fees>', async () => {
        const result = spawnSync('laconic', ['registry', 'bond', 'create', '--type', TOKEN_TYPE, '--quantity', bondBalance.toString(), '--gas', '200000', '--fees', `200000${TOKEN_TYPE}`]);

        const outputObj = checkResultAndRetrieveOutput(result);

        // Expect output object to have resultant bond id
        expect(outputObj.bondId).toBeDefined();

        bondId = outputObj.bondId;
      });

      test('laconic registry bond list', async () => {
        const result = spawnSync('laconic', ['registry', 'bond', 'list']);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected bond
        const expectedBond = getBondObj({ id: bondId, owner: bondOwner, balance: bondBalance });

        expect(outputObj.length).toEqual(1);
        expect(outputObj[0]).toEqual(expectedBond);
      });

      test('laconic registry bond list --owner <owner_address>', async () => {
        const result = spawnSync('laconic', ['registry', 'bond', 'list', '--owner', bondOwner]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected bond
        const expectedBond = getBondObj({ id: bondId, owner: bondOwner, balance: bondBalance });

        expect(outputObj.length).toEqual(1);
        expect(outputObj[0]).toEqual(expectedBond);
      });

      test('laconic registry bond get --id <bond_id>', async () => {
        const result = spawnSync('laconic', ['registry', 'bond', 'get', '--id', bondId]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected bond
        const expectedBond = getBondObj({ id: bondId, owner: bondOwner, balance: bondBalance });

        expect(outputObj.length).toEqual(1);
        expect(outputObj[0]).toEqual(expectedBond);
      });

      test('laconic registry bond refill --id <bond_id> --type <type> --quantity <quantity>', async () => {
        const bondRefillAmount = 1000;
        bondBalance += bondRefillAmount;

        const result = spawnSync('laconic', ['registry', 'bond', 'refill', '--id', bondId, '--type', TOKEN_TYPE, '--quantity', bondRefillAmount.toString()]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected output
        expect(outputObj).toEqual({ success: true });

        // Check updated bond
        const bondResult = spawnSync('laconic', ['registry', 'bond', 'get', '--id', bondId]);
        const bondOutputObj = checkResultAndRetrieveOutput(bondResult);

        // Expected bond
        const expectedBond = getBondObj({ id: bondId, owner: bondOwner, balance: bondBalance });

        expect(bondOutputObj.length).toEqual(1);
        expect(bondOutputObj[0]).toEqual(expectedBond);
      });

      test('laconic registry bond withdraw --id <bond_id> --type <type> --quantity <quantity>', async () => {
        const bondWithdrawAmount = 500;
        bondBalance -= bondWithdrawAmount;

        const result = spawnSync('laconic', ['registry', 'bond', 'withdraw', '--id', bondId, '--type', TOKEN_TYPE, '--quantity', bondWithdrawAmount.toString()]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected output
        expect(outputObj).toEqual({ success: true });

        // Check updated bond
        const bondResult = spawnSync('laconic', ['registry', 'bond', 'get', '--id', bondId]);
        const bondOutputObj = checkResultAndRetrieveOutput(bondResult);

        // Expected bond
        const expectedBond = getBondObj({ id: bondId, owner: bondOwner, balance: bondBalance });

        // Expect balance to be deducted
        expect(bondOutputObj.length).toEqual(1);
        expect(bondOutputObj[0]).toEqual(expectedBond);
      });

      test('laconic registry bond cancel --id <bond_id>', async () => {
        const result = spawnSync('laconic', ['registry', 'bond', 'cancel', '--id', bondId]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected output
        expect(outputObj).toEqual({ success: true });

        // Check updated bond
        const bondResult = spawnSync('laconic', ['registry', 'bond', 'get', '--id', bondId]);
        const bondOutputObj = checkResultAndRetrieveOutput(bondResult);

        // Expect empty object
        expect(bondOutputObj.length).toEqual(1);
        expect(bondOutputObj[0]).toEqual(null);
      });
    });

    describe('Account and tokens operations', () => {
      let balanceBeforeSend: number;

      test('laconic registry account get --address <account_address>', async () => {
        const result = spawnSync('laconic', ['registry', 'account', 'get', '--address', testAccount]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected account
        const expectedAccount = getAccountObj({ address: testAccount });

        expect(outputObj.length).toEqual(1);
        expect(outputObj[0]).toMatchObject(expectedAccount);
        expect(outputObj[0].number).toBeDefined();
        expect(outputObj[0].sequence).toBeDefined();

        balanceBeforeSend = Number(outputObj[0].balance[0].quantity);
        expect(balanceBeforeSend).toBeGreaterThan(0);
        expect(balanceBeforeSend).toBeLessThan(initialAccountBalance);
      });

      test('laconic registry tokens send --address <account_address> --type <token_type> --quantity <quantity>', async () => {
        const sendAmount = 1000000000;
        const balanceAfterSend = balanceBeforeSend - sendAmount;

        const result = spawnSync('laconic', ['registry', 'tokens', 'send', '--address', testAccount2, '--type', TOKEN_TYPE, '--quantity', sendAmount.toString()]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected acconts
        const expectedAccounts = [
          getAccountObj({ address: testAccount, balance: balanceAfterSend }),
          getAccountObj({ address: testAccount2, balance: sendAmount })
        ];

        expect(outputObj.tx.code).toEqual(0);
        expect(outputObj.tx.amount).toEqual(`${sendAmount}${TOKEN_TYPE}`);
        expect(outputObj.tx.sender).toEqual(testAccount);
        expect(outputObj.tx.recipient).toEqual(testAccount2);
        expect(outputObj.accounts.length).toEqual(2);
        expect(outputObj.accounts).toMatchObject(expectedAccounts);
      });

      test('laconic registry tokens gettx --hash <hash>', async () => {
        const sendAmount = 1000000000;

        const sendResult = spawnSync('laconic', ['registry', 'tokens', 'send', '--address', testAccount2, '--type', TOKEN_TYPE, '--quantity', sendAmount.toString()]);
        const sendOutput = checkResultAndRetrieveOutput(sendResult);
        expect(sendOutput.tx.code).toEqual(0);

        const gettxResult = spawnSync('laconic', ['registry', 'tokens', 'gettx', '--hash', sendOutput.tx.hash]);
        const gettxOutput = checkResultAndRetrieveOutput(gettxResult);

        expect(gettxOutput.hash).toEqual(sendOutput.tx.hash);
        expect(gettxOutput.code).toEqual(0);
        expect(gettxOutput.amount).toEqual(`${sendAmount}${TOKEN_TYPE}`);
        expect(gettxOutput.sender).toEqual(testAccount);
        expect(gettxOutput.recipient).toEqual(testAccount2);
      });
    });

    describe('Record operations', () => {
      const gas = 250000;
      const fees = `250000${TOKEN_TYPE}`;
      const bondBalance = 1000000000;

      test('laconic registry record publish --filename <record_file> --bond-id <bond_id> --gas <gas> --fees <fees>', async () => {
        // Create a new bond to be associated with the record
        ({ bondId: testRecordBondId } = createBond(bondBalance));
        const result = spawnSync('laconic', ['registry', 'record', 'publish', '--filename', testRecordFilePath, '--bond-id', testRecordBondId, '--gas', gas.toString(), '--fees', fees]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expect output object to resultant bond id
        expect(outputObj.id).toBeDefined();

        testRecordId = outputObj.id;
      });

      test('laconic registry record list', async () => {
        const result = spawnSync('laconic', ['registry', 'record', 'list']);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected record
        const expectedRecord = getRecordObj(testRecordFilePath, { bondId: testRecordBondId, recordId: testRecordId, names: null });

        expect(outputObj.length).toEqual(1);
        expect(outputObj[0]).toMatchObject(expectedRecord);
        expect(outputObj[0].createTime).toBeDefined();
        expect(outputObj[0].expiryTime).toBeDefined();
        expect(outputObj[0].owners).toBeDefined();
        expect(outputObj[0].owners.length).toEqual(1);
      });

      test('laconic registry record get --id <record_id>', async () => {
        const result = spawnSync('laconic', ['registry', 'record', 'get', '--id', testRecordId]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected record
        const expectedRecord = getRecordObj(testRecordFilePath, { bondId: testRecordBondId, recordId: testRecordId, names: null });

        expect(outputObj.length).toEqual(1);
        expect(outputObj[0]).toMatchObject(expectedRecord);
      });

      describe('Bond records operations', () => {
        let testRecordBondId2: string;

        test('laconic registry bond dissociate --id <record_id>', async () => {
          const result = spawnSync('laconic', ['registry', 'bond', 'dissociate', '--id', testRecordId]);
          const outputObj = checkResultAndRetrieveOutput(result);

          // Expected output
          expect(outputObj).toEqual({ success: true });

          const recordResult = spawnSync('laconic', ['registry', 'record', 'get', '--id', testRecordId]);
          const recordOutputObj = checkResultAndRetrieveOutput(recordResult);

          // Expected record
          const expectedRecord = getRecordObj(testRecordFilePath, { bondId: '', recordId: testRecordId, names: null });

          expect(recordOutputObj.length).toEqual(1);
          expect(recordOutputObj[0]).toMatchObject(expectedRecord);
        });

        test('laconic registry bond associate --id <record_id> --bond-id <bond_id>', async () => {
          // Create a new bond to be associated with the record
          ({ bondId: testRecordBondId2 } = createBond(bondBalance));

          const result = spawnSync('laconic', ['registry', 'bond', 'associate', '--id', testRecordId, '--bond-id', testRecordBondId2]);
          const outputObj = checkResultAndRetrieveOutput(result);

          // Expected output
          expect(outputObj).toEqual({ success: true });

          const recordResult = spawnSync('laconic', ['registry', 'record', 'get', '--id', testRecordId]);
          const recordOutputObj = checkResultAndRetrieveOutput(recordResult);

          // Expected record
          const expectedRecord = getRecordObj(testRecordFilePath, { bondId: testRecordBondId2, recordId: testRecordId, names: null });

          expect(recordOutputObj.length).toEqual(1);
          expect(recordOutputObj[0]).toMatchObject(expectedRecord);
        });

        test('laconic registry bond records reassociate --old-bond-id <old_bond_id> --new-bond-id <new_bond_id>', async () => {
          const result = spawnSync('laconic', ['registry', 'bond', 'records', 'reassociate', '--old-bond-id', testRecordBondId2, '--new-bond-id', testRecordBondId]);
          const outputObj = checkResultAndRetrieveOutput(result);

          // Expected output
          expect(outputObj).toEqual({ success: true });

          const recordResult = spawnSync('laconic', ['registry', 'record', 'get', '--id', testRecordId]);
          const recordOutputObj = checkResultAndRetrieveOutput(recordResult);

          // Expected record
          const expectedRecord = getRecordObj(testRecordFilePath, { bondId: testRecordBondId, recordId: testRecordId, names: null });

          expect(recordOutputObj.length).toEqual(1);
          expect(recordOutputObj[0]).toMatchObject(expectedRecord);
        });
      });
    });

    describe('Name authority operations (pre auction)', () => {
      test('laconic registry authority reserve <authority_name>', async () => {
        const result = spawnSync('laconic', ['registry', 'authority', 'reserve', testAuthorityName]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expect result
        expect(outputObj).toEqual({ success: true });
      });

      test('laconic registry authority whois <authority_name>', async () => {
        const result = spawnSync('laconic', ['registry', 'authority', 'whois', testAuthorityName]);
        const outputObj = checkResultAndRetrieveOutput(result);
        // Expected authority (still in auction)
        const expectedAuthority = getAuthorityObj({ owner: '', status: 'auction', auction: getAuctionObj({ owner: testAccount }) });

        expect(outputObj.length).toEqual(1);
        expect(outputObj[0]).toMatchObject(expectedAuthority);
        expect(outputObj[0].expiryTime).toBeDefined();
        expect(outputObj[0].height).toBeGreaterThan(0);

        testAuctionId = outputObj[0].auction.id;
      });
    });

    describe('Authority auction operations', () => {
      const bidAmount = 25000000;
      let bidRevealFilePath: string;

      test('laconic registry auction get <auction_id>', async () => {
        const result = spawnSync('laconic', ['registry', 'auction', 'get', testAuctionId]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected auction (still in commit stage)
        const expectedAuction = getAuctionObj({ owner: testAccount, status: 'commit' });

        expect(outputObj.length).toEqual(1);
        expect(outputObj[0]).toMatchObject(expectedAuction);
      });

      test('laconic registry auction bid commit <auction_id> <quantity> <type>', async () => {
        const result = spawnSync('laconic', ['registry', 'auction', 'bid', 'commit', testAuctionId, bidAmount.toString(), TOKEN_TYPE]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected output
        expect(outputObj.reveal_file).toBeDefined();

        bidRevealFilePath = outputObj.reveal_file;
      });

      test('laconic registry auction bid reveal <auction_id> <file_path>', async () => {
        // Wait for auction commits duration (60s)
        await delay(AUCTION_COMMIT_DURATION * 1000);

        const auctionResult = spawnSync('laconic', ['registry', 'auction', 'get', testAuctionId]);
        const auctionOutputObj = checkResultAndRetrieveOutput(auctionResult);

        const expectedAuction = getAuctionObj({ owner: testAccount, status: 'reveal' });
        const expectedBid = getBidObj({ bidder: testAccount });

        expect(auctionOutputObj[0]).toMatchObject(expectedAuction);
        expect(auctionOutputObj[0].bids[0]).toMatchObject(expectedBid);

        // Reveal bid
        const result = spawnSync('laconic', ['registry', 'auction', 'bid', 'reveal', testAuctionId, bidRevealFilePath]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected output
        expect(outputObj).toEqual({ success: true });

        const revealObject = JSON.parse(fs.readFileSync(bidRevealFilePath, 'utf8'));
        expect(revealObject).toMatchObject({
          chainId: CHAIN_ID,
          auctionId: testAuctionId,
          bidderAddress: testAccount,
          bidAmount: `${bidAmount}alnt`
        });
      }, (AUCTION_COMMIT_DURATION + 5) * 1000);
    });

    describe('Name authority operations (post auction)', () => {
      const testSubAuthorityName = 'echo.laconic';
      const testSubAuthorityName2 = 'kube.laconic';

      test('laconic registry authority whois <authority_name>', async () => {
        // Wait for auction reveals duration (60s)
        await delay(AUCTION_REVEAL_DURATION * 1000);

        const result = spawnSync('laconic', ['registry', 'authority', 'whois', testAuthorityName]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected authority (active)
        const expectedAuthority = getAuthorityObj({ owner: testAccount, status: 'active', auction: null });

        expect(outputObj.length).toEqual(1);
        expect(outputObj[0]).toMatchObject(expectedAuthority);
      }, (AUCTION_REVEAL_DURATION + 5) * 1000);

      test('laconic registry authority bond set laconic <bond_id>', async () => {
        // Create a new bond to be set on the authority
        const bondBalance = 1000000000;
        const { bondId } = createBond(bondBalance);

        const result = spawnSync('laconic', ['registry', 'authority', 'bond', 'set', testAuthorityName, bondId]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected output
        expect(outputObj).toEqual({ success: true });

        // Check updated authority
        const authorityResult = spawnSync('laconic', ['registry', 'authority', 'whois', testAuthorityName]);
        const authorityOutputObj = checkResultAndRetrieveOutput(authorityResult);

        // Expected authority (active with bond)
        const expectedAuthority = getAuthorityObj({ owner: testAccount, status: 'active', auction: null, bondId: bondId });

        expect(authorityOutputObj.length).toEqual(1);
        expect(authorityOutputObj[0]).toMatchObject(expectedAuthority);
      });

      test('laconic registry authority reserve <sub_authority> (same owner)', async () => {
        const result = spawnSync('laconic', ['registry', 'authority', 'reserve', testSubAuthorityName]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected output
        expect(outputObj).toEqual({ success: true });

        // Check updated authority
        const authorityResult = spawnSync('laconic', ['registry', 'authority', 'whois', testSubAuthorityName]);
        const authorityOutputObj = checkResultAndRetrieveOutput(authorityResult);

        // Expected authority (active with bond)
        const expectedAuthority = getAuthorityObj({ owner: testAccount, status: 'active', auction: null });

        expect(authorityOutputObj.length).toEqual(1);
        expect(authorityOutputObj[0]).toMatchObject(expectedAuthority);
      });

      test('laconic registry authority reserve <sub_authority> --owner <owner_address> (different owner)', async () => {
        const result = spawnSync('laconic', ['registry', 'authority', 'reserve', testSubAuthorityName2, '--owner', testAccount2]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected output
        expect(outputObj).toEqual({ success: true });

        // Check updated authority
        const authorityResult = spawnSync('laconic', ['registry', 'authority', 'whois', testSubAuthorityName2]);
        const authorityOutputObj = checkResultAndRetrieveOutput(authorityResult);

        // Expected authority (active with bond)
        const expectedAuthority = getAuthorityObj({ owner: testAccount2, status: 'active', auction: null });

        expect(authorityOutputObj.length).toEqual(1);
        expect(authorityOutputObj[0]).toMatchObject(expectedAuthority);
      });

      test('laconic registry authority list', async () => {
        const result = spawnSync('laconic', ['registry', 'authority', 'list']);
        const authoritiesOutputObj = checkResultAndRetrieveOutput(result);

        // Expected authorities
        const expectedAuthorities = [
          { name: 'echo.laconic', entry: { ownerAddress: testAccount, status: 'active' } },
          { name: 'kube.laconic', entry: { ownerAddress: testAccount2, status: 'active' } },
          { name: 'laconic', entry: { ownerAddress: testAccount, status: 'active' } }
        ];

        // Expected output
        expect(authoritiesOutputObj.length).toEqual(3);
        expect(authoritiesOutputObj).toMatchObject(expectedAuthorities);
      });

      test('laconic registry authority list --owner <owner_address>', async () => {
        let result = spawnSync('laconic', ['registry', 'authority', 'list', '--owner', testAccount]);
        const authoritiesByOwner1 = checkResultAndRetrieveOutput(result);

        // Expected output
        const expectedAuthoritiesByOwner1 = [
          { name: 'echo.laconic', entry: { ownerAddress: testAccount, status: 'active' } },
          { name: 'laconic', entry: { ownerAddress: testAccount, status: 'active' } }
        ];

        expect(authoritiesByOwner1.length).toEqual(2);
        expect(authoritiesByOwner1).toMatchObject(expectedAuthoritiesByOwner1);

        result = spawnSync('laconic', ['registry', 'authority', 'list', '--owner', testAccount2]);
        const authoritiesByOwner2 = checkResultAndRetrieveOutput(result);

        // Expected output
        const expectedAuthoritiesByOwner2 = [
          { name: 'kube.laconic', entry: { ownerAddress: testAccount2, status: 'active' } }
        ];

        expect(authoritiesByOwner2.length).toEqual(1);
        expect(authoritiesByOwner2).toMatchObject(expectedAuthoritiesByOwner2);
      });
    });

    describe('Name operations', () => {
      const testName = 'lrn://laconic/watcher/erc20';

      test('laconic registry name set <name> <record_id>', async () => {
        const result = spawnSync('laconic', ['registry', 'name', 'set', testName, testRecordId]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected output
        expect(outputObj).toEqual({ success: true });
      });

      test('laconic registry name lookup <name>', async () => {
        const result = spawnSync('laconic', ['registry', 'name', 'lookup', testName]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected output
        expect(outputObj.length).toEqual(1);
        expect(outputObj[0]).toMatchObject({ latest: { id: testRecordId } });
      });

      test('laconic registry name resolve <name>', async () => {
        const result = spawnSync('laconic', ['registry', 'name', 'resolve', testName]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected resolved record
        const expectedRecord = getRecordObj(testRecordFilePath, { bondId: testRecordBondId, recordId: testRecordId, names: [testName] });

        expect(outputObj.length).toEqual(1);
        expect(outputObj[0]).toMatchObject(expectedRecord);
      });

      test('laconic registry name delete <name>', async () => {
        const result = spawnSync('laconic', ['registry', 'name', 'delete', testName]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected output
        expect(outputObj).toEqual({ success: true });

        // Check that name doesn't resolve
        const resolveResult = spawnSync('laconic', ['registry', 'name', 'resolve', testName]);
        const resolveOutputObj = checkResultAndRetrieveOutput(resolveResult);
        expect(resolveOutputObj.length).toEqual(0);
      });
    });

    describe('Vickrey Auction operations', () => {
      const commitFee = 1000;
      const revealFee = 1000;
      const minimumBid = 100000;

      const bidAmount = 25000000;
      let bidRevealFilePath: string;

      test('laconic registry auction create --kind <kind> --commits-duration <commits_duration> --reveals-duration <reveals_duration> --denom <denom> --commit-fee <commit_fee> --reveal-fee <reveal_fee> --minimum-bid <minimum_bid>', async () => {
        const createAuctionResult = spawnSync('laconic', [
          'registry',
          'auction',
          'create',
          '--kind', AUCTION_KIND_VICKREY,
          '--commits-duration', AUCTION_COMMIT_DURATION.toString(),
          '--reveals-duration', AUCTION_REVEAL_DURATION.toString(),
          '--denom', TOKEN_TYPE,
          '--commit-fee', commitFee.toString(),
          '--reveal-fee', revealFee.toString(),
          '--minimum-bid', minimumBid.toString()
        ]);
        const outputObj = checkResultAndRetrieveOutput(createAuctionResult);

        expect(outputObj).toHaveProperty('auctionId');

        testAuctionId = outputObj.auctionId;
        const getAuctionResult = spawnSync('laconic', ['registry', 'auction', 'get', '--id', testAuctionId]);
        const auctionOutputObj = checkResultAndRetrieveOutput(getAuctionResult);

        const expectedAuctionObjPartial = {
          kind: AUCTION_KIND_VICKREY,
          status: AUCTION_STATUS.COMMIT,
          ownerAddress: testAccount,
          commitFee: { quantity: commitFee },
          revealFee: { quantity: revealFee },
          minimumBid: { quantity: minimumBid },
          winnerAddresses: [],
          winnerBids: [],
          maxPrice: { quantity: 0 },
          numProviders: 0,
          bids: []
        };
        expect(auctionOutputObj[0]).toMatchObject(expectedAuctionObjPartial);
      });

      test('laconic registry auction bid commit <auction_id> <quantity> <type>', async () => {
        const result = spawnSync('laconic', ['registry', 'auction', 'bid', 'commit', testAuctionId, bidAmount.toString(), TOKEN_TYPE]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected output
        expect(outputObj.reveal_file).toBeDefined();

        bidRevealFilePath = outputObj.reveal_file;
      });

      test('laconic registry auction bid reveal <auction_id> <file_path>', async () => {
        // Wait for auction commits duration (60s)
        await delay(AUCTION_COMMIT_DURATION * 1000);

        let auctionResult = spawnSync('laconic', ['registry', 'auction', 'get', testAuctionId]);
        let auctionOutputObj = checkResultAndRetrieveOutput(auctionResult);

        const expectedAuctionObjPartial = {
          status: AUCTION_STATUS.REVEAL,
          ownerAddress: testAccount,
          winnerAddresses: [],
          winnerBids: [],
          bids: [{
            bidderAddress: testAccount,
            status: AUCTION_STATUS.COMMIT,
            bidAmount: { quantity: 0 }
          }]
        };
        expect(auctionOutputObj[0]).toMatchObject(expectedAuctionObjPartial);

        // Reveal bid
        const result = spawnSync('laconic', ['registry', 'auction', 'bid', 'reveal', testAuctionId, bidRevealFilePath]);
        const outputObj = checkResultAndRetrieveOutput(result);

        // Expected output
        expect(outputObj).toEqual({ success: true });

        const revealObject = JSON.parse(fs.readFileSync(bidRevealFilePath, 'utf8'));
        expect(revealObject).toMatchObject({
          chainId: CHAIN_ID,
          auctionId: testAuctionId,
          bidderAddress: testAccount,
          bidAmount: `${bidAmount}${TOKEN_TYPE}`
        });

        // Get auction with revealed bid
        auctionResult = spawnSync('laconic', ['registry', 'auction', 'get', testAuctionId]);
        auctionOutputObj = checkResultAndRetrieveOutput(auctionResult);

        const expectedAuctionObjPartialOnBidReveal = {
          status: AUCTION_STATUS.REVEAL,
          winnerAddresses: [],
          bids: [{
            bidderAddress: testAccount,
            status: AUCTION_STATUS.REVEAL,
            bidAmount: { quantity: bidAmount }
          }]
        };
        expect(auctionOutputObj[0]).toMatchObject(expectedAuctionObjPartialOnBidReveal);
      }, (AUCTION_COMMIT_DURATION + 5) * 1000);

      test('laconic registry auction get <auction_id>', async () => {
        // Wait for auction reveals duration (60s)
        await delay(AUCTION_REVEAL_DURATION * 1000);

        const auctionResult = spawnSync('laconic', ['registry', 'auction', 'get', testAuctionId]);
        const auctionOutputObj = checkResultAndRetrieveOutput(auctionResult);

        const expectedAuctionObjPartial = {
          status: AUCTION_STATUS.COMPLETED,
          ownerAddress: testAccount,
          winnerAddresses: [testAccount],
          winnerBids: [{ quantity: bidAmount }],
          winnerPrice: { quantity: bidAmount }
        };
        expect(auctionOutputObj[0]).toMatchObject(expectedAuctionObjPartial);
      }, (AUCTION_COMMIT_DURATION + 5) * 1000);
    });

    describe.only('Provider Auction operations', () => {
      const commitFee = 1000;
      const revealFee = 1000;
      const maxPrice = 1000000;
      const numProviders = 2;
      const bidderInitialBlanace = 1000000000;
      const txFees = 200000;
      testAuctionId = '5e9dd5501e965f25db4fa62635d0ce5f6c59d73ab1a2ea999f8c5bf2f6fb6350';

      const bidderAccounts = [
        {
          privateKey: 'f40f8e2c9ba70595b6d1cf3bcc47ba539e7d6ad2bcdb16e26c1e369378fd5a55',
          address: 'laconic13cd6ntlcf5y0zmafg6wf96y6vsnq46xagpmjtc',
          bidAmount: 25000
        },
        {
          privateKey: '2c70e81c285e12f196837911aa258b11dff7e4189fc0f11e28cb228956807881',
          address: 'laconic15x7sw49w3x2pahjlr48hunp5gpr7hm54eg3f8h',
          bidAmount: 25300
        },
        {
          privateKey: '1d3a47900e1a5980b171419ac700e779330bc0f85389a4113ff608ca314e25bb',
          address: 'laconic1lkgay8ejvcwmngj3jua2ancdxxkukecz7hty89',
          bidAmount: 25200
        }
      ];
      const winnerAccounts = [bidderAccounts[0], bidderAccounts[2]];
      const winnerPrice = bidderAccounts[2].bidAmount;

      const bidRevealFilePaths: string[] = [];

      beforeAll(() => {
        // Fund all bidder accounts
        bidderAccounts.forEach(account => {
          spawnSync('laconic', ['registry', 'tokens', 'send', '--address', account.address, '--type', TOKEN_TYPE, '--quantity', bidderInitialBlanace.toString()]);
        });
      });

      test('laconic registry auction create --kind <kind> --commits-duration <commits_duration> --reveals-duration <reveals_duration> --denom <denom> --commit-fee <commit_fee> --reveal-fee <reveal_fee> --max-price <max_price> --num-providers <num_providers>', async () => {
        const createAuctionResult = spawnSync('laconic', [
          'registry',
          'auction',
          'create',
          '--kind', AUCTION_KIND_PROVIDER,
          '--commits-duration', AUCTION_COMMIT_DURATION.toString(),
          '--reveals-duration', AUCTION_REVEAL_DURATION.toString(),
          '--denom', TOKEN_TYPE,
          '--commit-fee', commitFee.toString(),
          '--reveal-fee', revealFee.toString(),
          '--max-price', maxPrice.toString(),
          '--num-providers', numProviders.toString()
        ]);

        const outputObj = checkResultAndRetrieveOutput(createAuctionResult);

        expect(outputObj).toHaveProperty('auctionId');

        testAuctionId = outputObj.auctionId;
        const getAuctionResult = spawnSync('laconic', ['registry', 'auction', 'get', '--id', testAuctionId]);
        const auctionOutputObj = checkResultAndRetrieveOutput(getAuctionResult);

        const expectedAuctionObjPartial = {
          kind: AUCTION_KIND_PROVIDER,
          status: AUCTION_STATUS.COMMIT,
          ownerAddress: testAccount,
          commitFee: { quantity: commitFee },
          revealFee: { quantity: revealFee },
          minimumBid: { quantity: 0 },
          winnerAddresses: [],
          winnerBids: [],
          maxPrice: { quantity: maxPrice },
          numProviders: numProviders,
          bids: []
        };
        expect(auctionOutputObj[0]).toMatchObject(expectedAuctionObjPartial);
      });

      test('laconic registry auction bid commit <auction_id> <quantity> <type>', async () => {
        for (const bidderAccount of bidderAccounts) {
          const result = spawnSync('laconic', ['registry', 'auction', 'bid', 'commit', testAuctionId, bidderAccount.bidAmount.toString(), TOKEN_TYPE, '--txKey', bidderAccount.privateKey]);
          const outputObj = checkResultAndRetrieveOutput(result);

          // Expected output
          expect(outputObj.reveal_file).toBeDefined();

          bidRevealFilePaths.push(outputObj.reveal_file);
        }

        const auctionResult = spawnSync('laconic', ['registry', 'auction', 'get', testAuctionId]);
        const auctionOutputObj = checkResultAndRetrieveOutput(auctionResult);

        const expectedBids = bidderAccounts.map(account => ({
          bidderAddress: account.address,
          status: AUCTION_STATUS.COMMIT,
          bidAmount: { quantity: 0 }
        }));
        const expectedAuctionObjPartial = {
          status: AUCTION_STATUS.COMMIT,
          ownerAddress: testAccount,
          winnerAddresses: [],
          winnerBids: [],
          bids: expectedBids
        };
        expect(auctionOutputObj[0]).toMatchObject(expectedAuctionObjPartial);
      });

      test('laconic registry auction bid reveal <auction_id> <file_path>', async () => {
        // Wait for auction commits duration (60s)
        await delay(AUCTION_COMMIT_DURATION * 1000);

        // Reveal bid
        for (let i = 0; i < bidderAccounts.length; i++) {
          const result = spawnSync('laconic', ['registry', 'auction', 'bid', 'reveal', testAuctionId, bidRevealFilePaths[i], '--txKey', bidderAccounts[i].privateKey]);
          const outputObj = checkResultAndRetrieveOutput(result);

          // Expected output
          expect(outputObj).toEqual({ success: true });

          const revealObject = JSON.parse(fs.readFileSync(bidRevealFilePaths[i], 'utf8'));
          expect(revealObject).toMatchObject({
            chainId: CHAIN_ID,
            auctionId: testAuctionId,
            bidderAddress: bidderAccounts[i].address,
            bidAmount: `${bidderAccounts[i].bidAmount}${TOKEN_TYPE}`
          });
        }

        // Get auction with revealed bid
        const auctionResult = spawnSync('laconic', ['registry', 'auction', 'get', testAuctionId]);
        const auctionOutputObj = checkResultAndRetrieveOutput(auctionResult);

        const expectedBids = bidderAccounts.map(account => ({
          bidderAddress: account.address,
          status: AUCTION_STATUS.REVEAL,
          bidAmount: { quantity: account.bidAmount }
        }));
        const expectedAuctionObjPartialOnBidReveal = {
          status: AUCTION_STATUS.REVEAL,
          winnerAddresses: [],
          bids: expectedBids
        };
        expect(auctionOutputObj[0]).toMatchObject(expectedAuctionObjPartialOnBidReveal);
      }, (AUCTION_COMMIT_DURATION + 60) * 1000);

      test('laconic registry auction get <auction_id>', async () => {
        // Wait for auction reveals duration (60s)
        await delay(AUCTION_REVEAL_DURATION * 1000);

        const auctionResult = spawnSync('laconic', ['registry', 'auction', 'get', testAuctionId]);
        const auctionOutputObj = checkResultAndRetrieveOutput(auctionResult);

        const expectedWinnerAddresses = winnerAccounts.map(account => account.address);
        const expectedWinnerBids = winnerAccounts.map(account => ({ quantity: account.bidAmount }));

        const expectedAuctionObjPartial = {
          status: AUCTION_STATUS.COMPLETED,
          ownerAddress: testAccount,
          winnerAddresses: expectedWinnerAddresses,
          winnerBids: expectedWinnerBids,
          winnerPrice: { quantity: winnerPrice },
          fundsReleased: false
        };
        expect(auctionOutputObj[0]).toMatchObject(expectedAuctionObjPartial);
      }, (AUCTION_REVEAL_DURATION + 5) * 1000);

      test('laconic registry auction release-funds <auction_id>', async () => {
        const result = spawnSync('laconic', ['registry', 'auction', 'release-funds', testAuctionId]);
        const outputObj = checkResultAndRetrieveOutput(result);

        expect(outputObj).toEqual({ success: true });

        const auctionResult = spawnSync('laconic', ['registry', 'auction', 'get', testAuctionId]);
        const auctionOutputObj = checkResultAndRetrieveOutput(auctionResult);

        const expectedAuctionObjPartial = {
          status: AUCTION_STATUS.COMPLETED,
          ownerAddress: testAccount,
          fundsReleased: true
        };
        expect(auctionOutputObj[0]).toMatchObject(expectedAuctionObjPartial);

        const expectedBalances = [
          bidderInitialBlanace - (commitFee) - (2 * txFees) + winnerPrice,
          bidderInitialBlanace - (commitFee) - (2 * txFees),
          bidderInitialBlanace - (commitFee) - (2 * txFees) + winnerPrice
        ];

        for (let i = 0; i < bidderAccounts.length; i++) {
          const result = spawnSync('laconic', ['registry', 'account', 'get', '--address', bidderAccounts[i].address]);
          const outputObj = checkResultAndRetrieveOutput(result);

          // Expected account
          const expectedAccount = getAccountObj({ address: bidderAccounts[i].address, balance: expectedBalances[i] });

          expect(outputObj.length).toEqual(1);
          expect(outputObj[0]).toMatchObject(expectedAccount);
        }
      });
    });

    describe('Gas and fees config', () => {
      const bondAmount = 1000;

      test('gas set, fees set to Xalnt', async () => {
        // gasPrice not set
        const result = spawnSync('laconic', ['registry', 'bond', 'create', '--type', TOKEN_TYPE, '--quantity', bondAmount.toString()]);

        const outputObj = checkResultAndRetrieveOutput(result);
        expect(outputObj.bondId).toBeDefined();

        // gasPrice set (lower than min gas price)
        updateGasAndFeesConfig(undefined, undefined, '0.00001alnt');
        const result1 = spawnSync('laconic', ['registry', 'bond', 'create', '--type', TOKEN_TYPE, '--quantity', bondAmount.toString()]);

        const outputObj1 = checkResultAndRetrieveOutput(result1);
        expect(outputObj1.bondId).toBeDefined();
      });

      test('gas not set, fees not set, gasPrice set', async () => {
        updateGasAndFeesConfig(null, null, '1alnt');
        const result = spawnSync('laconic', ['registry', 'bond', 'create', '--type', TOKEN_TYPE, '--quantity', bondAmount.toString()]);

        const outputObj = checkResultAndRetrieveOutput(result);
        expect(outputObj.bondId).toBeDefined();
      });

      test('gas not set, fees set without token suffix, gasPrice set', async () => {
        updateGasAndFeesConfig(null, '1.8', '1alnt');
        const result = spawnSync('laconic', ['registry', 'bond', 'create', '--type', TOKEN_TYPE, '--quantity', bondAmount.toString()]);

        const outputObj = checkResultAndRetrieveOutput(result);
        expect(outputObj.bondId).toBeDefined();
      });

      test('gas not set, fees not set, gasPrice not set', async () => {
        updateGasAndFeesConfig(null, null, null);
        const result = spawnSync('laconic', ['registry', 'bond', 'create', '--type', TOKEN_TYPE, '--quantity', bondAmount.toString()]);

        expect(result.status).toBe(1);

        const output = result.stdout.toString().trim();
        const errorOutput = result.stderr.toString().trim();

        expect(output).toBe('');
        expect(errorOutput).toContain('Gas price must be set in the client options when auto gas is used.');
      });
    });
  });
});
