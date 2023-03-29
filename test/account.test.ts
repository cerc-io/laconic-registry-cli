import {cliTest} from './helper';

const args= "account "
const type= "aphoton"
const quantity="10"
const address="ethm1vc62ysqu504at932jjq8pwrqgjt67rx6ggn5yu"

describe("test account",() => {
    it("get account should return account details",async ()=>{
        // send tokens to account to avoid account not found error
        const sendResp=cliTest("tokens send --address "+address+" --type "+type+" --quantity "+quantity)
        expect(sendResp).toBeDefined;
        
        const resp=cliTest(args+"get --address "+address);
        expect(resp).toBeDefined;
        expect(resp[0].address).toEqual(address)
    });
});