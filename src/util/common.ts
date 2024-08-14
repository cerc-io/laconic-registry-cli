import { Arguments } from 'yargs';
import clean from 'lodash-clean';

export const getConnectionInfo = (argv: Arguments, config: any) => {
  const { server, userKey, bondId, txKey, chainId, fees, gas } = argv;

  const result = {
    ...config,
    userKey: stripHexPrefix(config.userKey),
    ...clean({ server, userKey, bondId, txKey, chainId }),
    privateKey: stripHexPrefix(txKey || userKey || config.userKey),
    gas: String(gas || config.gas),
    fees: String(fees || config.fees)
  };

  return result;
};

function stripHexPrefix (hex: string): string {
  return hex && hex.startsWith('0x') ? hex.slice(2) : hex;
}
