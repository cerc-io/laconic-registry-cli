# laconic-registry-client

CLI utility written in TS, used to interact with laconicd. Depends on [registry-sdk](https://git.vdb.to/cerc-io/registry-sdk).

## Setup

* Run `yarn` to install all dependencies.

* Create a `config.yml` file from [config.example.yml](./config.example.yml) file.

## Account Setup

Run the chain:

  - In laconicd repo run:

    ```bash
    TEST_AUCTION_ENABLED=true ./init.sh
    ```

Registering records in registry requires an account. To get account private key run:

```bash
$ laconicd keys export mykey --unarmored-hex --unsafe
```

In `config.yml` file assign the account private key to `userKey`.

## Gas and Fees

https://docs.evmos.org/users/basics/gas.html

* Transactions require `gas`, set to the maximum value the transaction is allowed to consume.
* Typically, validators also require transaction `fees` to be provided to allow the transaction into the mempool.

The `gas` and `fees` can be set to some default values in the config, and can be overriden for each command using the `--gas` and `--fees` arguments.

Example:

```bash
$ laconic registry bond create --type photon --quantity 1000000000 --gas 200000 --fees 200000photon
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
$ laconic registry account get --address ethm133y09mveksh76uc99h4rl38nd033tk4e3y2z52
[
  {
    "address": "ethm133y09mveksh76uc99h4rl38nd033tk4e3y2z52",
    "pubKey": "A2BeFMnq4h0v5/hP+trvQbCtVWwGGYNSHWRJ7Ae60biS",
    "number": "0",
    "sequence": "37",
    "balance": [
      {
        "type": "photon",
        "quantity": "89998999999999991999799300"
      }
    ]
  }
]
```

Send tokens:

```bash
$ laconic registry tokens send --address ethm1vc62ysqu504at932jjq8pwrqgjt67rx6ggn5yu --type photon --quantity 1000000000
[
  {
    "address": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "pubKey": "A68/q7/xazFzNj+rrvE07ALxkMgqw1ugL35VECkWAYvt",
    "number": "0",
    "sequence": "16",
    "balance": [
      {
        "type": "photon",
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
        "type": "photon",
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
  type: WebsiteRegistrationRecord
  url: 'https://cerc.io'
  repo_registration_record_cid: QmSnuWmxptJZdLJpKRarxBMS2Ju2oANVrgbr2xWbie9b2D
  build_artifact_cid: QmP8jTG1m9GSDJLCbeWhVSVgEzCPPwXRdCRuJtQ5Tz9Kc9
  tls_cert_cid: QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR
  version: 1.0.23
```

Publish record (see below for commands to create/query bonds):

```bash
$ laconic registry record publish --filename watcher.yml --bond-id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785 --gas 250000

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
$ laconic registry record list
```

Reserve authority:

```bash
$ laconic registry authority reserve laconic
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
      "ownerAddress": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
      "createTime": "2022-04-26T11:43:45.679728594",
      "commitsEndTime": "2022-04-26T11:44:45.679728594",
      "revealsEndTime": "2022-04-26T11:45:45.679728594",
      "commitFee": {
        "type": "photon",
        "quantity": "1000000"
      },
      "revealFee": {
        "type": "photon",
        "quantity": "1000000"
      },
      "minimumBid": {
        "type": "photon",
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
    "ownerAddress": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "createTime": "2022-04-26T11:42:05.256059269",
    "commitsEndTime": "2022-04-26T11:44:45.679728594",
    "revealsEndTime": "2022-04-26T11:45:45.679728594",
    "commitFee": {
      "type": "photon",
      "quantity": "1000000"
    },
    "revealFee": {
      "type": "photon",
      "quantity": "1000000"
    },
    "minimumBid": {
      "type": "photon",
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
$ laconic registry auction bid commit 0294fb2e3659c347b53a6faf4bef041fd934f0f3ab13df6d2468d5d63abacd48 25000000 photon

Reveal file: ./out/bafyreiay2rccax64yn4ljhvzvm3jkbebvzheyucuma5jlbpzpzd5i5gjuy.json
```

Reveal an auction bid:

```bash
$ laconic registry auction bid reveal 0294fb2e3659c347b53a6faf4bef041fd934f0f3ab13df6d2468d5d63abacd48 ./out/bafyreiay2rccax64yn4ljhvzvm3jkbebvzheyucuma5jlbpzpzd5i5gjuy.json
```

Set authority bond (after winning auction):

```bash
$ laconic registry authority bond set laconic 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785
```

Create sub-authority (same owner as parent authority):

```bash
$ laconic registry authority reserve echo.laconic
```

Create sub-authority (custom owner for sub-authority):

```bash
$ laconic registry authority reserve kube.laconic --owner ethm1vc62ysqu504at932jjq8pwrqgjt67rx6ggn5yu
```

Set name:

```bash
$ laconic registry name set lrn://laconic/watcher/erc20 bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba
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
$ laconic registry bond create --type photon --quantity 1000
```

List bonds:

```bash
$ laconic registry bond list
[
  {
    "id": "58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785",
    "owner": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "balance": [
      {
        "type": "photon",
        "quantity": "698000000"
      }
    ]
  },
  {
    "id": "5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0",
    "owner": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "balance": [
      {
        "type": "photon",
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
    "owner": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "balance": [
      {
        "type": "photon",
        "quantity": "691000000"
      }
    ]
  }
]
```

Query bonds by owner:

```bash
$ laconic registry bond list --owner ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8
[
  {
    "id": "58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785",
    "owner": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "balance": [
      {
        "type": "photon",
        "quantity": "684000000"
      }
    ]
  },
  {
    "id": "5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0",
    "owner": "ethm1lfekr7gvqtnhpp2kwdc6u2n569cqsp4ww0m4y8",
    "balance": [
      {
        "type": "photon",
        "quantity": "1000"
      }
    ]
  }
]
```

Refill bond:

```bash
$ laconic registry bond refill --id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785 --type photon --quantity 1000
```

Withdraw funds from bond:

```bash
$ laconic registry bond withdraw --id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785 --type photon --quantity 500
```

Cancel bond:

```bash
$ laconic registry bond cancel --id 58508984500aa2ed18e059fa8203b40fbc9828e3bfa195361335c4e4524c4785
```

Associate bond (with record):

```bash
$ laconic registry bond associate --id bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba --bond-id 5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0
```

Disassociate bond (from record):

```bash
$ laconic registry bond dissociate --id bafyreic3auqajvgszh3vfjsouew2rsctswukc346dmlf273ln4g6iyyhba
```

Dissociate all records from bond:

```bash
$ laconic registry bond records dissociate --bond-id 5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0
```

Reassociate records (switch bond):

```bash
$ laconic registry bond records reassociate --old-bond-id 5c40abd336ae1561f2a1b55be73b12f5a083080bf879b4c9288d182d238badb0 --new-bond-id 3e11c61f179897e4b12e9b63de35d36f88ac146755e7a28ce0bcdd07cf3a03ae
```
