import {cliTest} from './helper';

const args= "bond "
const quantity=1000000000
const refillQuantity=100
const withdrawQuantity=100
const type="aphoton"

var bondId: string;
var address: string;
var recordId: string;

describe("test bond",() => {
    
    beforeAll(async () => {
        const resp=JSON.parse(cliTest("account get"));
        expect(resp).toBeDefined;
        address=resp[0].address

        // get 2 bondids (old, new)
        // get record id
    });
    

    it("create bond",async ()=>{
        const resp=cliTest(args+"create --type "+type+" --quantity "+quantity);
        expect(resp).toBeDefined;
    });

    it("list bond",async ()=>{
        const resp=cliTest(args+"list");
        bondId=JSON.parse(resp)[0].id
        expect(resp).toBeDefined;
    });

    it("get bond",async ()=>{
        const resp=cliTest(args+"get --id "+bondId);
        expect(resp).toBeDefined;
    });

    it("list bonds by owner",async ()=>{
        const resp=cliTest(args+"list --owner "+address);
        expect(resp).toBeDefined;
    });

    it("refill bond",async ()=>{
        const resp=cliTest(args+"refill --id "+bondId+" --type "+type+" --quantity "+refillQuantity);
        expect(resp).toBeDefined;
    });

    it("withdraw funds from bond",async ()=>{
        const resp=cliTest(args+"withdraw --id "+bondId+" --type "+type+" --quantity "+withdrawQuantity);
        expect(resp).toBeDefined;
    });

    it("cancel bond",async ()=>{
        const resp=cliTest(args+"cancel --id "+bondId);
        expect(resp).toBeDefined;
    });

    it("associate bond with record",async ()=>{
        const resp=cliTest(args+"associate --id "+recordId+" --bond-id "+bondId);
        expect(resp).toBeDefined;
    });

    it("dissociate bond from record",async ()=>{
        const resp=cliTest(args+"dissociate --id "+recordId);
        expect(resp).toBeDefined;
    });

    it("dissociate all records from bond",async ()=>{
        const resp=cliTest(args+"records dissociate --bond-id "+bondId);
        expect(resp).toBeDefined;
    });

    it("reassociate all records from bond",async ()=>{
        const resp=cliTest(args+"records reassociate --old-bond-id "+bondId+" --new-bond-id "+bondId);
        expect(resp).toBeDefined;
    });
});