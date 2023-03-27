import {cliTest,createBond,createRecord} from './helper';

const args= "name ";
const name="laconic-name";
const crn=`crn://${name}/app/test`;

var recordId: string;

describe("test names",() => {
    
    beforeAll(async () => {
        // get bond id
        const bondId = createBond("aphoton","10000000")

        // get record id
        recordId=createRecord("./test/examples/watcher.yml",bondId)

        // reserve authority
        cliTest("authority reserve "+name);

        // set authority bond
        cliTest(args+"bond set "+name+" "+bondId);
    });
    

    it("set name",async ()=>{
        const resp=cliTest(args+"set "+crn+" "+recordId);
        expect(resp).toBeDefined;
    });

    it("lookup name",async ()=>{
        const resp=cliTest(args+"lookup "+ crn);
        expect(resp).toBeDefined;
    });

    it("resolve name",async ()=>{
        const resp=cliTest(args+"resolve "+crn);
        expect(resp).toBeDefined;
    });

    it("delelte name",async ()=>{
        const resp=cliTest(args+"delete "+crn);
        expect(resp).toBeDefined;
    });
});