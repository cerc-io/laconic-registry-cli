import {cliTest,createAuthority, getAuctionId} from './helper';

jest.setTimeout(3 * 60 * 1000);

const args= "auction ";
const quantity=25000000
const type="aphoton"
const name=`laconic-auction-${Date.now()}`


var auctionId: string;
var filepath: string;

if (!process.env.TEST_AUCTIONS_ENABLED) {
    // Required as jest complains if file has no tests.
    test('skipping auction tests', () => {});
  } else {
    describe("test auction",() => {
        beforeAll(async () => {
            // reserve authority
           createAuthority(name)
           auctionId = getAuctionId(name)
        });
    
        it("get auction",async ()=>{
            const resp=cliTest(args+"get "+auctionId);
            expect(resp).toBeDefined();
            expect(resp.length).toEqual(1);
            expect(resp[0].id).toEqual(auctionId)
        });

        it("bid commit",async ()=>{
            const resp=cliTest(args+"bid commit "+auctionId+" "+quantity+" "+type);
            expect(resp).toBeDefined();
            expect(resp.reveal_file).toBeDefined();
    
            filepath = resp.reveal_file

            const auction=cliTest(args+"get "+auctionId);
            expect(auction).toBeDefined;
            expect(auction.length).toEqual(1);
            expect(auction[0].bids.length).toEqual(1);
            expect(auction[0].bids[0].bidAmount.quantity).toEqual("0")
        });
    
        it("Wait for reveal phase.", (done) => {
            setTimeout(done, 60 * 1000);
        });
    
        it("bid reveal", async ()=>{
            const resp=cliTest(args+"bid reveal "+auctionId+" "+filepath);
            expect(resp).toBeDefined();
            expect(resp.success).toBeTruthy();

            const auction=cliTest(args+"get "+auctionId);
            expect(auction).toBeDefined;
            expect(auction.length).toEqual(1);
            expect(auction[0].bids.length).toEqual(1);
            expect(auction[0].bids[0].bidAmount.quantity).toEqual(quantity+"")
        });
    });
  }

