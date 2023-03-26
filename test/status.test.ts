import {cliTest} from './helper';

const args= "status "

var recordId: string;
var name: string;

describe("test status",() => {

    it("get status",async ()=>{
        const resp=cliTest(args);
        expect(resp).toBeDefined;
    });
});