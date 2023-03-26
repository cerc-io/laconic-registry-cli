import {cliTest,createAuthority} from './helper';

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
        const resp=JSON.parse(cliTest(args+"bid commit "+auctionId+" "+quantity+" "+type));
        expect(resp).toBeDefined;

        filepath = resp.substring(resp.indexOf("./out"))
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