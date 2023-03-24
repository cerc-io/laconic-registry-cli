import {cliTest} from './helper';

const args= "name "

var recordId: string;
var name: string;

describe("test names",() => {
    
    beforeAll(async () => {
        // get record id
    });
    

    it("set name",async ()=>{
        const resp=cliTest(args+"set "+name+" "+recordId);
        expect(resp).toBeDefined;
    });

    it("lookup name",async ()=>{
        const resp=cliTest(args+"lookup "+ name);
        expect(resp).toBeDefined;
    });

    it("resolve name",async ()=>{
        const resp=cliTest(args+"resolve "+name);
        expect(resp).toBeDefined;
    });

    it("delelte name",async ()=>{
        const resp=cliTest(args+"delete "+name);
        expect(resp).toBeDefined;
    });
});