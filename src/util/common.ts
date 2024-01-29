import { Arguments } from 'yargs';
import clean from 'lodash-clean';

export const getConnectionInfo = (argv: Arguments, config: any) => {
  const { server, userKey, bondId, txKey, chainId, fees, gas } = argv;

  const result = {
    ...config,
    ...clean({ server, userKey, bondId, txKey, chainId }),
    privateKey: txKey || userKey || config.userKey,
    gas: String(gas || config.gas),
    fees: String(fees || config.fees)
  };

  return result;
};
