
export const txOutput = (result:any, msg:string, output:unknown, verbose:unknown) => {
  if (output === 'json') {
    console.log(verbose ? JSON.parse(JSON.stringify(result)) : JSON.parse(msg));
  } else {
    console.log(verbose ? JSON.stringify(result, undefined, 2) : msg);
  }
};

export const queryOutput = (result: any, output: unknown) => {
  if (output === 'json') {
    console.log(JSON.parse(JSON.stringify(result)));
  } else {
    console.log(JSON.stringify(result, (key, value) => {
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }, 2));
  }
};
