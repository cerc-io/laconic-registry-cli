import {cliTest,createAuthority} from './helper';

jest.setTimeout(3 * 60 * 1000);

const args= "auction ";
const quantity=25000000
const type="aphoton"


var auctionId: string;
var filepath: string;

describe("test auction",() => {
    beforeAll(async () => {
        // get auction id   
        auctionId = createAuthority("laconic-auction")
    });

    it("bid commit",async ()=>{
        const resp=cliTest(args+"bid commit "+auctionId+" "+quantity+" "+type);
        expect(resp).toBeDefined;

        filepath = "."+resp.substring(resp.indexOf("/out/"))
    });

    it("Wait for reveal phase.", (done) => {
        setTimeout(done, 60 * 1000);
    });

    it("bid reveal", async ()=>{
        const resp=JSON.parse(cliTest(args+"bid reveal "+auctionId+" "+filepath));
        expect(resp).toBeDefined;
    });

    it("get auction",async ()=>{
        const resp=JSON.parse(cliTest(args+"get "+auctionId));
        expect(resp).toBeDefined;
    });
});