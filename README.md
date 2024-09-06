# laconic-registry-client

CLI utility written in TS, used to interact with laconicd. Depends on [registry-sdk](https://git.vdb.to/cerc-io/registry-sdk).

## Install

* Add `.npmrc` file in desired project to resolve package

  ```bash
  @cerc-io:registry=https://git.vdb.to/api/packages/cerc-io/npm/
  ```

  This will set the registry for `cerc-io` scoped packages in the project

* Install the CLI using package manager

  ```bash
  yarn add @cerc-io/laconic-registry-cli
  ```

* For installing CLI globally add `.npmrc` file above in home directory and run

  ```bash
  yarn global add @cerc-io/laconic-registry-cli
  ```

## Setup

* Run `yarn` to install all dependencies.

* Run `yarn build`.

* Create a `config.yml` file from [config.example.yml](./config.example.yml) file.

* Add CLI cmd to path

  ```bash
  export PATH="$PWD/bin:$PATH"
  ```

## Account Setup

Run the chain:

* In laconicd repo run:

    ```bash
    TEST_AUCTION_ENABLED=true ./scripts/init.sh clean
    ```

Registering records in registry requires an account. To get account private key run:

```bash
laconicd keys export alice --keyring-backend test  --unarmored-hex --unsafe
```

In `config.yml` file assign the account private key to `userKey`:

```yml
services:
  registry:
    ..
    userKey: "<user-key>"
    ..
```

## Gas and Fees

* Gas and fees in `cosmos-sdk`:
  * <https://docs.cosmos.network/v0.50/learn/beginner/gas-fees>
  * `gas` is a special unit that is used to track the consumption of resources during execution of a transaction
    * The maximum value a tx is allowed to consume can be capped by setting `gas` in the config
  * `fees` have to be paid by sender to allow the transaction into the mempool and is calculated using `gasPrice`:

    ```bash
    fees = gas * gasPrice
    ```

  * Typically, validators / full nodes set `min-gas-prices` to only allow txs providing minimum amount of fees
* Using `cosmjs`, there are two ways max fees amount can be given for a tx:
  * Either by specifying `fees` and `gas` (in which case `fees` should be >= `gas` * `min-gas-price`)
  * Or by specifying a `gasPrice` (in which case `gasPrice` should be >= `min-gas-price` set by the node and fees is `auto` calculated by simulating the tx)

    When using the `auto` fees calculation, the gas estimation by tx simulation is typically multiplied by a multiplier
* As such, following `gas`, `fees` and `gasPrice` combinations can be used in `laconic-registry-cli`:
  * Gas set, fees set to `Xalnt`:

    ```bash
    # Example
    gas: 500000
    fees: 500000alnt
    gasPrice:
    ```

    * `gasPrice` config ignored
    * tx rejected if given `fees` < `gas` * `min-gas-price` set by the node
    * tx fails mid-execution if it runs out of given `gas`
  * Fees not set, gas price set to `Xalnt`:

    ```bash
    # Example
    gas:
    fees:
    gasPrice: 1alnt
    ```

    * `gas` config ignored
    * uses `auto` fee calculation using gas estimation with [default multiplier](https://git.vdb.to/cerc-io/registry-sdk/src/branch/main/src/constants.ts) value from `registry-sdk`
    * tx rejected if given `gasPrice` < `min-gas-price` set by the node
    * tx fails mid-execution if it runs out of calculated gas
  * Fees set to a `X` (without `alnt` suffix), gas price set to `Yalnt`:

    ```bash
    # Example
    gas:
    fees: 1.8
    gasPrice: 1alnt
    ```

    * `gas` config ignored
    * uses `auto` fee calculation using gas estimation with `fees` as the multiplier
    * tx rejected if given `gasPrice` < `min-gas-price` set by the node
    * tx fails mid-execution if it runs out of calculated gas, can be retried with a higher gas estimation multiplier (`fees`)
  * Fees and gas price both not set:

    ```bash
    # Example
    gas:
    fees:
    gasPrice:
    ```

    * `gas` config ignored
    * uses `auto` fee calculation using gas estimation
    * throws error:

      ```bash
      Gas price must be set in the client options when auto gas is used.
      ```

* The `gas`, `fees` and `gasPrice` can be set to some default values in the config as shown above, and can be overriden for each command using the `--gas`, `--fees` and `--gasPrice` arguments:

  ```bash
  # Example:
  laconic registry bond create --type alnt --quantity 100000000000 --gas 200000 --fees 200000alnt
  ```

## Operations

These commands require a `config.yml` file present in the current working directory when using the CLI.

Get node status:

```bash
$ laconic registry status
{
  "version": "0.3.0",
  "node": {
    "id": "de88d9400eea3040ee7e12dfc4b08d513d9781e2",
    "network": "laconic_9000-1",
    "moniker": "localtestnet"
  },
  "sync": {
    "latest_block_hash": "5C97CBB692A9D06AE0B271F51DD76B919899870B5B3A0D892595D40EAA478BC5",
    "latest_block_height": "243",
    "latest_block_time": "2022-04-26 16:29:59.57788157 +0530 IST",
    "catching_up": false
  },
  "validator": {
    "address": "0B897228C1F46EC306BA36B69134725BCC75E747",
    "voting_power": "1000000000000000"
  },
  "validators": [
    {
      "address": "0B897228C1F46EC306BA36B69134725BCC75E747",
      "voting_power": "1000000000000000",
      "proposer_priority": "0"
    }
  ],
  "num_peers": "0",
  "peers": [],
  "disk_usage": "4.7M"
}
```

Get account details:

```bash
$ laconic registry account get --address laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k
[
  {
    "address": "laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k",
    "pubKey": "A2BeFMnq4h0v5/hP+trvQbCtVWwGGYNSHWRJ7Ae60biS",
    "number": "0",
    "sequence": "37",
    "balance": [
      {
        "type": "alnt",
        "quantity": "89998999999999991999799300"
      }
    ]
  }
]
```

Send tokens:

```bash
$ laconic registry tokens send --address laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k --type alnt --quantity 1000000000
{
  "tx": {
    "hash": "977152CBE474613E1BBAFEF286F12134829FAF3C9E7C8349149DE3E687B816FC",
    "height": 343369,
    "index": 0,
    "code": 0,
    "log": "",
    "sender": "laconic1pmuxrcnuhhf8qdllzuf2ctj2tnwwcg6yswqnyd",
    "recipient": "laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k",
    "amount": "1000000000alnt"
  },
  "accounts": [
    {
      "address": "laconic1pmuxrcnuhhf8qdllzuf2ctj2tnwwcg6yswqnyd",
      "pubKey": "A68/q7/xazFzNj+rrvE07ALxkMgqw1ugL35VECkWAYvt",
      "number": "0",
      "sequence": "16",
      "balance": [
        {
          "type": "alnt",
          "quantity": "99998999999999997973999700"
        }
      ]
    },
    {
      "address": "laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k",
      "pubKey": null,
      "number": "12",
      "sequence": "0",
      "balance": [
        {
          "type": "alnt",
          "quantity": "1000000000"
        }
      ]
    }
  ]
}
```

Get token TX details:

```bash
$ laconic registry tokens gettx --hash 977152CBE474613E1BBAFEF286F12134829FAF3C9E7C8349149DE3E687B816FC
{
  "hash": "977152CBE474613E1BBAFEF286F12134829FAF3C9E7C8349149DE3E687B816FC",
  "height": 343369,
  "index": 0,
  "code": 0,
  "log": "",
  "sender": "laconic1pmuxrcnuhhf8qdllzuf2ctj2tnwwcg6yswqnyd",
  "recipient": "laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k",
  "amount": "1000000000alnt",
  "raw": "0A91010A8E010A1C2F636F736D6F732E62616E6B2E763162657461312E4D736753656E64126E0A2E6C61636F6E696331347763303777613372377270707275343367396A786B7A68716E686D76666D34646765793673122E6C61636F6E6963317971706337637966657470676D71746B6B30756B657675676561617539703063776D6A6C73751A0C0A04616C6E7412043130303012680A500A460A1F2F636F736D6F732E63727970746F2E736563703235366B312E5075624B657912230A2102F3A1D077638F9FD828C4CF126FE82E0BE98388083F5BC1E1DD4D84132AEBFF8112040A020801185A12140A0E0A04616C6E7412063430303030301080B5181A4088DF7BA4B63EA68E185AB2887C9EC29EBC4158874BC037816B8494AD36D3B2433B5223CECC336D4624BB7FEF4DBB4A8B5F4707ACD8E55443312009E9473DF821"
}
```

Create record (generic):

```yaml
# watcher.yml
record:
  type: WebsiteRegistrationRecord
  url: 'https://cerc.io'
  repo_registration_record_cid: QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D
  build_artifact_cid: QmP8jTG1m9GSDJLCbeWhVSVgEzCPPwXRdCRuJtQ5Tz9Kc9
  tls_cert_cid: QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR
  version: 1.0.23
```

Publish record (see below for commands to create/query bonds):

```bash
$ laconic registry record publish --filename watcher.yml --bond-id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785 --gas 250000 --fees 250000alnt

{ id: 'bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba' }
```

Get record:

```bash
$ laconic registry record get --id bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba
[
  {
    "id": "bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba",
    "names": null,
    "owners": [
      "A44019FBD06DA0425C15B064F5AF854DE35129BA"
    ],
    "bondId": "f9921625fa07fef0e499653b2ac88371c1aaf5dd0c1732ded6df8c7f9fb5665a",
    "createTime": "2022-04-26T11:17:09Z",
    "expiryTime": "2023-04-26T11:17:09Z",
    "attributes": {
      "name": "ERC20 Watcher",
      "package": {
        "linux": {
          "arm": {
            "/": "QmX3DDmeFunX5aVmaTNnViwQUe15Wa4UbZYcC3AwFwoWcg"
          },
          "x64": {
            "/": "QmVRmLrQeLZS8Xee7YVzYYAQANWmXqsNgNkaPMxM8MtPLA"
          }
        },
        "macos": {
          "x64": {
            "/": "QmXogCVZZ867qZfS3CYjYdDEziPb4ARiDfgwqbd7urVKkr"
          }
        }
      },
      "protocol": {
        "/": "QmbQiRpLX5djUsfc2yDswHvTkHTGd9uQEy6oUJfxkBYwRq"
      },
      "type": "watcher",
      "version": "1.0.0"
    }
  }
]
```

List records:

```bash
laconic registry record list
```

Reserve authority:

```bash
laconic registry authority reserve laconic
```

Check authority information:

```bash
$ laconic registry authority whois laconic
[
  {
    "ownerAddress": "",
    "ownerPublicKey": "",
    "height": "183",
    "status": "expired",
    "bondId": "",
    "expiryTime": "2022-04-26 11:50:45.679728594 +0000 UTC",
    "auction": {
      "id": "0294fb2e3659c347b53a6faf4bef041fd934f0f3ab13df6d2468d5d63abacd48",
      "status": "commit",
      "ownerAddress": "laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k",
      "createTime": "2022-04-26T11:43:45.679728594",
      "commitsEndTime": "2022-04-26T11:44:45.679728594",
      "revealsEndTime": "2022-04-26T11:45:45.679728594",
      "commitFee": {
        "type": "alnt",
        "quantity": "1000000"
      },
      "revealFee": {
        "type": "alnt",
        "quantity": "1000000"
      },
      "minimumBid": {
        "type": "alnt",
        "quantity": "5000000"
      },
      "winnerAddress": "",
      "winnerBid": {
        "type": "",
        "quantity": "0"
      },
      "winnerPrice": {
        "type": "",
        "quantity": "0"
      },
      "bids": []
    }
  }
]
```

Get authority auction info:

```bash
$ laconic registry auction get 0294fb2e3659c347b53a6faf4bef041fd934f0f3ab13df6d2468d5d63abacd48
[
  {
    "id": "0294fb2e3659c347b53a6faf4bef041fd934f0f3ab13df6d2468d5d63abacd48",
    "status": "commit",
    "ownerAddress": "laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k",
    "createTime": "2022-04-26T11:42:05.256059269",
    "commitsEndTime": "2022-04-26T11:44:45.679728594",
    "revealsEndTime": "2022-04-26T11:45:45.679728594",
    "commitFee": {
      "type": "alnt",
      "quantity": "1000000"
    },
    "revealFee": {
      "type": "alnt",
      "quantity": "1000000"
    },
    "minimumBid": {
      "type": "alnt",
      "quantity": "5000000"
    },
    "winnerAddress": "",
    "winnerBid": {
      "type": "",
      "quantity": "0"
    },
    "winnerPrice": {
      "type": "",
      "quantity": "0"
    },
    "bids": []
  }
]
```

Commit an auction bid:

```bash
$ laconic registry auction bid commit 0294fb2e3659c347b53a6faf4bef041fd934f0f3ab13df6d2468d5d63abacd48 25000000 alnt

Reveal file: ./out/bafyreiay2rccax64yn4ljhvzvm3jkbebvzheyucuma5jlbpzpzd5i5gjuy.json
```

Reveal an auction bid:

```bash
laconic registry auction bid reveal 0294fb2e3659c347b53a6faf4bef041fd934f0f3ab13df6d2468d5d63abacd48 ./out/bafyreiay2rccax64yn4ljhvzvm3jkbebvzheyucuma5jlbpzpzd5i5gjuy.json
```

Set authority bond (after winning auction):

```bash
laconic registry authority bond set laconic 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785
```

Create sub-authority (same owner as parent authority):

```bash
laconic registry authority reserve echo.laconic
```

Create sub-authority (custom owner for sub-authority):

```bash
laconic registry authority reserve kube.laconic --owner laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k
```

Get all the authorities:

```bash
laconic registry authority list
```

Get all the authorities by owner:

```bash
laconic registry authority list --owner laconic1zayjut6pd4xy9dguut56v55hktzmeq6r777hmd
```

Set name:

```bash
laconic registry name set lrn://laconic/watcher/erc20 bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba
```

Lookup name information:

```bash
$ laconic registry name lookup lrn://laconic/watcher/erc20
[
  {
    "latest": {
      "id": "bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba",
      "height": "736"
    }
  }
]
```

Resolve name:

```bash
$ laconic registry name resolve lrn://laconic/watcher/erc20
[
    {
        "id": "bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba",
        "names": null,
        "owners": [
            "D90CC0B1D4AF0CF17408060A22521333DEC8B59C"
        ],
        "bondId": "58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785",
        "createTime": "2022-04-26T12:28:07Z",
        "expiryTime": "2023-04-26T12:28:07Z",
        "attributes": {
            "package": {
                "linux": {
                    "arm": {
                        "/": "QmX3DDmeFunX5aVmaTNnViwQUe15Wa4UbZYcC3AwFwoWcg"
                    },
                    "x64": {
                        "/": "QmVRmLrQeLZS8Xee7YVzYYAQANWmXqsNgNkaPMxM8MtPLA"
                    }
                },
                "macos": {
                    "x64": {
                        "/": "QmXogCVZZ867qZfS3CYjYdDEziPb4ARiDfgwqbd7urVKkr"
                    }
                }
            },
            "protocol": {
                "/": "QmbQiRpLX5djUsfc2yDswHvTkHTGd9uQEy6oUJfxkBYwRq"
            },
            "type": "watcher",
            "version": "1.0.0",
            "name": "ERC20 Watcher"
        }
    }
]
```

Delete name:

```bash
$ laconic registry name delete lrn://laconic/watcher/erc20

$ laconic registry name resolve lrn://laconic/watcher/erc20
[
    null
]
```

Create bond:

```bash
laconic registry bond create --type alnt --quantity 1000
```

List bonds:

```bash
$ laconic registry bond list
[
  {
    "id": "58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785",
    "owner": "laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k",
    "balance": [
      {
        "type": "alnt",
        "quantity": "698000000"
      }
    ]
  },
  {
    "id": "5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0",
    "owner": "laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k",
    "balance": [
      {
        "type": "alnt",
        "quantity": "1000"
      }
    ]
  }
]
```

Get bond:

```bash
$ laconic registry bond get --id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785
[
  {
    "id": "58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785",
    "owner": "laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k",
    "balance": [
      {
        "type": "alnt",
        "quantity": "691000000"
      }
    ]
  }
]
```

Query bonds by owner:

```bash
$ laconic registry bond list --owner laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k
[
  {
    "id": "58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785",
    "owner": "laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k",
    "balance": [
      {
        "type": "alnt",
        "quantity": "684000000"
      }
    ]
  },
  {
    "id": "5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0",
    "owner": "laconic15za32wly5exgcrt2zfr8php4ya49n5y7masu7k",
    "balance": [
      {
        "type": "alnt",
        "quantity": "1000"
      }
    ]
  }
]
```

Refill bond:

```bash
laconic registry bond refill --id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785 --type alnt --quantity 1000
```

Withdraw funds from bond:

```bash
laconic registry bond withdraw --id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785 --type alnt --quantity 500
```

Cancel bond:

```bash
laconic registry bond cancel --id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785
```

Associate bond (with record):

```bash
laconic registry bond associate --id bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba --bond-id 5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0
```

Disassociate bond (from record):

```bash
laconic registry bond dissociate --id bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba
```

Dissociate all records from bond:

```bash
laconic registry bond records dissociate --bond-id 5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0
```

Reassociate records (switch bond):

```bash
laconic registry bond records reassociate --old-bond-id 5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0 --new-bond-id 3e11c61f179897e4b12e9b63de35d36f88ac146755e7a28ce0bcdd07cf3a03ae
```
