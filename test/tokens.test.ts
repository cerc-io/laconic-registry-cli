import {cliTest} from './helper';

const args= "tokens "
const type= "aphoton"
const quantity=10
const address="ethm1vc62ysqu504at932jjq8pwrqgjt67rx6ggn5yu"

describe("test account",() => {
    it("get account should return account details",async ()=>{
        // balance before
        var balanceBefore;
        const beforeResp=cliTest("account get --address "+address);
        if (beforeResp.stderr){
            expect(beforeResp.stderr.toString()).toContain("account "+address+ " not found")
            balanceBefore=0
        } else{
            balanceBefore=beforeResp[0].balance[0].quantity
        }
    
        // send tokens to account
        const sendResp=cliTest(args+"send --address "+address+" --type "+type+" --quantity "+quantity)
        expect(sendResp).toBeDefined();
        
        // balance after
        var balanceAfter;
        const afterResp=cliTest("account get --address "+address);
        if (afterResp.stderr){
            expect(afterResp.stderr.toString()).toContain("account "+address+ " not found")
            balanceAfter=0
        } else{
            balanceAfter=afterResp[0].balance[0].quantity
        }

        expect(balanceAfter-balanceBefore).toEqual(quantity)
    });
});