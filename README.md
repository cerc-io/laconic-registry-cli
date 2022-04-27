# chiba-clonk-sdk

## Setup

* Run `yarn` to install all dependencies.

* This repo uses chiba-clonk-client. We will need to use this locally.

  * Run the following in [chiba-clonk-client repo](https://github.com/vulcanize/chiba-clonk-client):

    ```bash
    $ yarn

    $ yarn build

    $ yarn link
    ```

  * In chiba-clonk-sdk repo run:

    ```bash
    $ yarn link chiba-clonk-client
    ```

* Create a `config.yml` file from [config.example.yml](./config.example.yml) file.

## Account Setup

Registering records in CNS requires an account. To get account private key run:

```bash
$ chibaclonkd keys export mykey --unarmored-hex --unsafe
```

In `config.yml` file assign the account private key to `userKey`.

## Gas and Fees

https://docs.evmos.org/users/basics/gas.html

* Transactions require `gas`, set to the maximum value the transaction is allowed to consume.
* Typically, validators also require transaction `fees` to be provided to allow the transaction into the mempool.

The `gas` and `fees` can be set to some default values in the config, and can be overriden for each command using the `--gas` and `--fees` arguments.

Example:

```bash
$ chiba cns bond create --type aphoton --quantity 1000000000 --gas 200000 --fees 200000aphoton
```

## Operations

These commands require a `config.yml` file present in the current working directory when using the CLI.

Get node status:

```bash
$ chiba cns status
{
  "version": "0.3.0",
  "node": {
    "id": "de88d9400eea3040ee7e12dfc4b08d513d9781e2",
    "network": "chibaclonk_9000-1",
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
$ chiba cns account get --address ethm133y09mveksh76uc99h4rl38nd033tk4e3y2z52
[
  {
    "address": "ethm133y09mveksh76uc99h4rl38nd033tk4e3y2z52",
    "pubKey": "A2BeFMnq4h0v5/hP+trvQbCtVWwGGYNSHWRJ7Ae60biS",
    "number": "0",
    "sequence": "37",
    "balance": [
      {
        "type": "aphoton",
        "quantity": "89998999999999991999799300"
      }
    ]
  }
]
```

Send tokens:

```bash
$ chiba cns tokens send --address ethm1vc62ysqu504at932jjq8pwrqgjt67rx6ggn5yu --type aphoton --quantity 1000000000
[
  {
    "address": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "pubKey": "A68/q7/xazFzNj+rrvE07ALxkMgqw1ugL35VECkWAYvt",
    "number": "0",
    "sequence": "16",
    "balance": [
      {
        "type": "aphoton",
        "quantity": "99998999999999997973999700"
      }
    ]
  },
  {
    "address": "ethm1vc62ysqu504at932jjq8pwrqgjt67rx6ggn5yu",
    "pubKey": null,
    "number": "12",
    "sequence": "0",
    "balance": [
      {
        "type": "aphoton",
        "quantity": "1000000000"
      }
    ]
  }
]
```

Create record (generic):

```yaml
# watcher.yml
record:
  name: ERC20 Watcher
  type: watcher
  version: 1.0.0
  protocol:
    /: QmbQiRpLX5djUsfc2yDswHvTkHTGd9uQEy6oUJfxkBYwRq
  package:
    linux:
      x64:
        /: QmVRmLrQeLZS8Xee7YVzYYAQANWmXqsNgNkaPMxM8MtPLA
      arm:
        /: QmX3DDmeFunX5aVmaTNnViwQUe15Wa4UbZYcC3AwFwoWcg
    macos:
      x64:
        /: QmXogCVZZ867qZfS3CYjYdDEziPb4ARiDfgwqbd7urVKkr
```

Publish record (see below for commands to create/query bonds):

```bash
$ chiba cns record publish --filename watcher.yml --bond-id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785

{ id: 'bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba' }
```

Get record:

```bash
$ chiba cns record get --id bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba
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
$ chiba cns record list
```

Reserve authority:

```bash
$ chiba cns authority reserve chiba-clonk
```

Check authority information:

```bash
$ chiba cns authority whois chiba-clonk
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
      "ownerAddress": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
      "createTime": "2022-04-26T11:43:45.679728594",
      "commitsEndTime": "2022-04-26T11:44:45.679728594",
      "revealsEndTime": "2022-04-26T11:45:45.679728594",
      "commitFee": {
        "type": "aphoton",
        "quantity": "1000000"
      },
      "revealFee": {
        "type": "aphoton",
        "quantity": "1000000"
      },
      "minimumBid": {
        "type": "aphoton",
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
$ chiba cns auction get 0294fb2e3659c347b53a6faf4bef041fd934f0f3ab13df6d2468d5d63abacd48
[
  {
    "id": "0294fb2e3659c347b53a6faf4bef041fd934f0f3ab13df6d2468d5d63abacd48",
    "status": "commit",
    "ownerAddress": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "createTime": "2022-04-26T11:42:05.256059269",
    "commitsEndTime": "2022-04-26T11:44:45.679728594",
    "revealsEndTime": "2022-04-26T11:45:45.679728594",
    "commitFee": {
      "type": "aphoton",
      "quantity": "1000000"
    },
    "revealFee": {
      "type": "aphoton",
      "quantity": "1000000"
    },
    "minimumBid": {
      "type": "aphoton",
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
$ chiba cns auction bid commit 0294fb2e3659c347b53a6faf4bef041fd934f0f3ab13df6d2468d5d63abacd48 25000000 aphoton

Reveal file: ./out/bafyreiay2rccax64yn4ljhvzvm3jkbebvzheyucuma5jlbpzpzd5i5gjuy.json
```

Reveal an auction bid:

```bash
$ chiba cns auction bid reveal 0294fb2e3659c347b53a6faf4bef041fd934f0f3ab13df6d2468d5d63abacd48 ./out/bafyreiay2rccax64yn4ljhvzvm3jkbebvzheyucuma5jlbpzpzd5i5gjuy.json
```

Set authority bond (after winning auction):

```bash
$ chiba cns authority bond set chiba-clonk 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785
```

Create sub-authority (same owner as parent authority):

```bash
$ chiba cns authority reserve echo.chiba-clonk
```

Create sub-authority (custom owner for sub-authority):

```bash
$ chiba cns authority reserve kube.chiba-clonk --owner ethm1vc62ysqu504at932jjq8pwrqgjt67rx6ggn5yu
```

Set name:

```bash
$ chiba cns name set crn://chiba-clonk/watcher/erc20 bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba
```

Lookup name information:

```bash
$ chiba cns name lookup crn://chiba-clonk/watcher/erc20
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
$ chiba cns name resolve crn://chiba-clonk/watcher/erc20
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
$ chiba cns name delete crn://chiba-clonk/watcher/erc20

$ chiba cns name resolve crn://chiba-clonk/watcher/erc20
[
    null
]
```

Create bond:

```bash
$ chiba cns bond create --type aphoton --quantity 1000
```

List bonds:

```bash
$ chiba cns bond list
[
  {
    "id": "58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785",
    "owner": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "balance": [
      {
        "type": "aphoton",
        "quantity": "698000000"
      }
    ]
  },
  {
    "id": "5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0",
    "owner": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "balance": [
      {
        "type": "aphoton",
        "quantity": "1000"
      }
    ]
  }
]
```

Get bond:

```bash
$ chiba cns bond get --id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785
[
  {
    "id": "58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785",
    "owner": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "balance": [
      {
        "type": "aphoton",
        "quantity": "691000000"
      }
    ]
  }
]
```

Query bonds by owner:

```bash
$ chiba cns bond list --owner ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8
[
  {
    "id": "58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785",
    "owner": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "balance": [
      {
        "type": "aphoton",
        "quantity": "684000000"
      }
    ]
  },
  {
    "id": "5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0",
    "owner": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "balance": [
      {
        "type": "aphoton",
        "quantity": "1000"
      }
    ]
  }
]
```

Refill bond:

```bash
$ chiba cns bond refill --id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785 --type aphoton --quantity 1000
```

Withdraw funds from bond:

```bash
$ chiba cns bond withdraw --id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785 --type aphoton --quantity 500
```

Cancel bond:

```bash
$ chiba cns bond cancel --id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785
```

Associate bond (with record):

```bash
$ chiba cns bond associate --id bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba --bond-id 5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0
```

Disassociate bond (from record):

```bash
$ chiba cns bond dissociate --id bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba
```

Dissociate all records from bond:

```bash
$ chiba cns bond records dissociate --bond-id 5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0
```

Reassociate records (switch bond):

```bash
$ chiba cns bond records reassociate --old-bond-id 5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0 --new-bond-id 3e11c61f179897e4b12e9b63de35d36f88ac146755e7a28ce0bcdd07cf3a03ae
```
