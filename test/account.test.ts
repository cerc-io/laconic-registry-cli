import {cliTest} from './helper';

const args= "account "
export var address=""

describe("test account",() => {
    it("get account should return account details",async ()=>{
        const resp=JSON.parse(cliTest(args+"get"));
        expect(resp).toBeDefined;
        address=resp[0].address
    });
});