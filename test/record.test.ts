import {cliTest,createBond, updateRecord} from './helper';

const args= "record "
const filename = "./test/examples/watcher.yml"

var recordId: string;
var bondId: string;

describe("test record",() => {
    
    beforeAll(async () => {
        // get bondId
        bondId=createBond("aphoton","1000000000")
        updateRecord(filename)
    });

    it("publish record",async ()=>{
        const resp=cliTest(args+"publish --filename "+filename+" --bond-id "+bondId);
        expect(resp).toBeDefined();
        console.log(resp.toString())
        expect(resp.id).toBeDefined();

        recordId=resp.id
    });

    it("get record",async ()=>{
        const resp=cliTest(args+"get --id "+recordId);
        expect(resp).toBeDefined();
        expect(resp.length).toEqual(1);
        expect(resp[0].id).toEqual(recordId)
        expect(resp[0].bondId).toEqual(bondId)
    });

    it("list records",async ()=>{
        const resp=cliTest(args+"list");
        expect(resp).toBeDefined();
        expect(resp.length).toBeGreaterThan(0);
    });
});