import {cliTest,createBond,createRecord} from './helper';

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
        const resp=cliTest("account get");
        expect(resp).toBeDefined();
        address=resp[0].address        
    });
    

    it("create bond",async ()=>{
        const resp=cliTest(args+"create --type "+type+" --quantity "+quantity);
        expect(resp.bondId).toBeDefined();
        bondId=resp.bondId
    });

    it("list bond",async ()=>{
        const resp=cliTest(args+"list");
        expect(resp.length).toBeGreaterThan(0);
        const lenghtBefore=resp.length

        createBond(type,quantity+"")

        const respAfter=cliTest(args+"list");
        expect(respAfter.length-lenghtBefore).toEqual(1)

    });

    it("get bond",async ()=>{
        const resp=cliTest(args+"get --id "+bondId);
        expect(resp.length).toEqual(1);
        expect(resp[0].id).toEqual(bondId);
        expect(Number(resp[0].balance[0].quantity)).toEqual(quantity);
    });

    it("list bonds by owner",async ()=>{
        const resp=cliTest(args+"list --owner "+address);
        expect(resp).toBeDefined();
        expect(resp.length).toBeGreaterThan(0);
        expect(resp[0].owner).toEqual(address);
    });

    it("refill bond",async ()=>{
        const resp=cliTest(args+"refill --id "+bondId+" --type "+type+" --quantity "+refillQuantity);
        expect(resp).toBeDefined();
        expect(resp.success).toBeTruthy();

        const getResp=cliTest(args+"get --id "+bondId);
        expect(getResp.length).toEqual(1);
        expect(getResp[0].id).toEqual(bondId);
        expect(Number(getResp[0].balance[0].quantity)).toEqual(quantity+refillQuantity);
    });

    it("withdraw funds from bond, insufficient",async ()=>{
        const resp=cliTest(args+"withdraw --id "+bondId+" --type "+type+" --quantity "+withdrawQuantity+quantity*2);
        expect(resp.stderr).toBeDefined();
        expect(resp.stderr.toString()).toContain("Insufficient bond balance.: insufficient funds")
    });

    it("withdraw funds from bond",async ()=>{
        const resp=cliTest(args+"withdraw --id "+bondId+" --type "+type+" --quantity "+withdrawQuantity);
        expect(resp).toBeDefined();
        expect(resp.success).toBeTruthy();

        const getResp=cliTest(args+"get --id "+bondId);
        expect(getResp.length).toEqual(1);
        expect(getResp[0].id).toEqual(bondId);
        expect(Number(getResp[0].balance[0].quantity)).toEqual(quantity+refillQuantity-withdrawQuantity);
    });

    it("cancel bond",async ()=>{
        const resp=cliTest(args+"cancel --id "+bondId);
        expect(resp).toBeDefined;
        expect(resp.success).toBeTruthy();

        const getResp=cliTest(args+"get --id "+bondId);
        expect(getResp.length).toEqual(1);
        expect(getResp[0].id).toEqual("");
    });

    it("associate bond with record",async ()=>{
        // get new bond Id
        bondId=createBond(type,quantity+"")
        // get record Id
        recordId=createRecord("./test/examples/watcher.yml",bondId)

        // dissociate bond from record
        const dissociate=cliTest(args+"dissociate --id "+recordId);
        expect(dissociate).toBeDefined;
        expect(dissociate.success).toBeTruthy();

        // get new bond Id
        const newbondId=createBond(type,quantity+"")

        const resp=cliTest(args+"associate --id "+recordId+" --bond-id "+newbondId);
        expect(resp).toBeDefined();
        expect(resp.success).toBeTruthy();

        // check for bond id in record
        const getRecord=cliTest(" record get --id "+recordId)
        expect(getRecord).toBeDefined();
        expect(getRecord.length).toEqual(1);
        expect(getRecord[0].id).toEqual(recordId);
        expect(getRecord[0].bondId).toEqual(newbondId);
    });

    it("dissociate bond from record",async ()=>{
        const resp=cliTest(args+"dissociate --id "+recordId);
        expect(resp).toBeDefined;
        expect(resp.success).toBeTruthy();

        // check for bond id in record
        const getRecord=cliTest(" record get --id "+recordId)
        expect(getRecord).toBeDefined();
        expect(getRecord.length).toEqual(1);
        expect(getRecord[0].id).toEqual(recordId);
        expect(getRecord[0].bondId).toEqual("");
    });

    it("dissociate all records from bond",async ()=>{
         // associate bond to record
         const associate=cliTest(args+"associate --id "+recordId+" --bond-id "+bondId);
         expect(associate).toBeDefined;
         expect(associate.success).toBeTruthy();
 
        const resp=cliTest(args+"records dissociate --bond-id "+bondId);
        expect(resp).toBeDefined;
        expect(resp.success).toBeTruthy();

        // check for bond id in record
        const getRecord=cliTest(" record get --id "+recordId)
        expect(getRecord).toBeDefined();
        expect(getRecord.length).toEqual(1);
        expect(getRecord[0].id).toEqual(recordId);
        expect(getRecord[0].bondId).toEqual("");
    });

    it("reassociate all records from bond",async ()=>{
        // get new bondid
        const newBondId =createBond(type,quantity+"")

        // associate bond to record
        const associate=cliTest(args+"associate --id "+recordId+" --bond-id "+bondId);
        expect(associate).toBeDefined;
        expect(associate.success).toBeTruthy();

        const resp=cliTest(args+"records reassociate --old-bond-id "+bondId+" --new-bond-id "+newBondId);
        expect(resp).toBeDefined;
        expect(resp.success).toBeTruthy();

        // check for bond id in record
        const getRecord=cliTest(" record get --id "+recordId)
        expect(getRecord).toBeDefined();
        expect(getRecord.length).toEqual(1);
        expect(getRecord[0].id).toEqual(recordId);
        expect(getRecord[0].bondId).toEqual(newBondId);
    });
});