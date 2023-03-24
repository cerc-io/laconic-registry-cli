import {cliTest} from './helper';

const args= "record "

var recordId: string;
var filename: string;
var bondId: string;

describe("test names",() => {
    
    beforeAll(async () => {
        // get bond id
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