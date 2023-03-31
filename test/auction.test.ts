import {cliTest,createAuthority, getAuctionId} from './helper';

jest.setTimeout(3 * 60 * 1000);

const args= "auction ";
const quantity=25000000
const type="aphoton"
const name="laconic-auction"


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
    
        it("bid commit",async ()=>{
            const resp=cliTest(args+"bid commit "+auctionId+" "+quantity+" "+type);
            expect(resp).toBeDefined;
    
            filepath = resp.reveal_file
        });
    
        it("Wait for reveal phase.", (done) => {
            setTimeout(done, 60 * 1000);
        });
    
        it("bid reveal", async ()=>{
            const resp=cliTest(args+"bid reveal "+auctionId+" "+filepath);
            expect(resp).toBeDefined;
        });
    
        it("get auction",async ()=>{
            const resp=cliTest(args+"get "+auctionId);
            expect(resp).toBeDefined;
        });
    });
  }

