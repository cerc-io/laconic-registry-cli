import {cliTest} from './helper';

const args= "status "

describe("test status",() => {

    it("get status",async ()=>{
        const resp=cliTest(args);
        expect(resp).toBeDefined;
    });
});