## Run CLI tests

* Follow the project `Setup` and `Account Setup` from root [README](./../README.md)

* Add laconic cmd to path

  ```bash
  export PATH="$PWD/bin:$PATH"
  ```

* Create a .env file using [.env.example](./.env.example):

  ```bash
  cp .env.example .env
  ```

* Get account address of test account:

  ```bash
  laconicd keys list --keyring-backend test

  # - address: laconic10er85pyd7ukw732e88fzv7k0jq205764hye2dx
  #   name: alice
  #   pubkey: '{"@type":"/cosmos.crypto.secp256k1.PubKey","key":"AsDoWlNIr3W013pOiwmopaB/SaWQj6r3g56xb2d9GxYK"}'
  #   type: local
  ```

  Use the `address` field from the result and assign it in `TEST_ACCOUNT` field of `.env` file

* Run CLI tests:

  ```bash
  yarn test
  ```
