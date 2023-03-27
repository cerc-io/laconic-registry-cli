import {cliTest,createBond} from './helper';

const args= "authority "
const name="laconic"

var bondId: string;

describe("test authority",() => {
    
    beforeAll(async () => {
        // get bond id
        bondId=createBond("aphoton","1000000000")
    });
    

    it("reserve authority",async ()=>{
        const resp=cliTest(args+"reserve "+name);
        expect(resp).toBeDefined;
    });

    it("lookup authority information.",async ()=>{
        const resp=cliTest(args+"whois "+ name);
        expect(resp).toBeDefined;
    });

    it("set authority bond",async ()=>{
        const resp=cliTest(args+"bond set "+name+" "+bondId);
        expect(resp).toBeDefined;
    });
});