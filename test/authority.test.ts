import {cliTest,createBond} from './helper';

const args= "authority "
const name=`laconic-${Date.now()}`

var bondId: string;

describe("test authority",() => {
    
    beforeAll(async () => {
        // get bond id
        bondId=createBond("aphoton","1000000000")
    });
    

    it("reserve authority",async ()=>{
        const resp=cliTest(args+"reserve "+name);
        expect(resp).toBeDefined();
        expect(resp.success).toBeTruthy();
    });

    it("lookup authority information.",async ()=>{
        const resp=cliTest(args+"whois "+ name);
        expect(resp).toBeDefined();
        expect(resp.length).toEqual(1);
        expect(resp[0].status).toEqual("active")
        expect(resp[0].bondId).toEqual("")
    });

    it("set authority bond",async ()=>{
        const bondSet=cliTest(args+"bond set "+name+" "+bondId);
        expect(bondSet).toBeDefined();
        expect(bondSet.success).toBeTruthy();

        const resp=cliTest(args+"whois "+ name);
        expect(resp).toBeDefined();
        expect(resp.length).toEqual(1);
        expect(resp[0].status).toEqual("active")
        expect(resp[0].bondId).toEqual(bondId)
    });
});