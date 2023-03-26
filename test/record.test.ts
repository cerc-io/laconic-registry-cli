import {cliTest,createBond} from './helper';

const args= "record "
const filename = "./test/examples/watcher.yml"

var recordId: string;
var bondId: string;

describe("test record",() => {
    
    beforeAll(async () => {
        // get bondId
        bondId=createBond("aphoton","1000000000")
    });

    it("publish record",async ()=>{
        const resp=cliTest(args+"publish --filename "+filename+" --bond-id "+bondId);
        expect(resp).toBeDefined;
    });

    it("get record",async ()=>{
        const resp=cliTest(args+"get --id "+recordId);
        expect(resp).toBeDefined;
    });

    it("list records",async ()=>{
        const resp=cliTest(args+"list");
        expect(resp).toBeDefined;
    });
});