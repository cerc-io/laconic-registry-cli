import {cliTest,createAuthority,createBond,createRecord} from './helper';

const args= "name ";
const name=`laconic-${Date.now()}`;
const crn=`crn://${name}/app/test`;

var recordId: string;
var bondId: string;

describe("test names",() => {
    
    beforeAll(async () => {
        // get bond id
        bondId = createBond("aphoton","10000000")

        // get record id
        recordId=createRecord("./test/examples/watcher.yml",bondId)

        // reserve authority
        createAuthority(name)

        // set authority bond
        const resp=cliTest("authority bond set "+name+" "+bondId);
        expect(resp).toBeDefined();
        expect(resp.success).toBeTruthy();
    });
    

    it("set name",async ()=>{
        const resp=cliTest(args+"set "+crn+" "+recordId);
        expect(resp).toBeDefined();
        expect(resp.success).toBeTruthy();
    });

    it("lookup name",async ()=>{
        const resp=cliTest(args+"lookup "+ crn);
        expect(resp).toBeDefined();
        expect(resp[0].latest.id).toEqual(recordId)
    });

    it("resolve name",async ()=>{
        const resp=cliTest(args+"resolve "+crn);
        expect(resp).toBeDefined();
        expect(resp[0].id).toEqual(recordId)
    });

    it("delete name",async ()=>{
        const resp=cliTest(args+"delete "+crn);
        expect(resp).toBeDefined();
        expect(resp.success).toBeTruthy();

        const resolve=cliTest(args+"resolve "+crn);
        expect(resolve).toBeDefined();
        expect(resolve[0]).toBeNull();
    });
});