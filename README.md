# eth-signature-verifier

Minimal Ethereum signature verifier for [EIP-712](https://eips.ethereum.org/EIPS/eip-712), [EIP-191](https://eips.ethereum.org/EIPS/eip-191), and `eth_sign`. No ethers.js, no web3.js. Zero dependencies.

## Install

```bash
npm install eth-signature-verifier
````

## Usage

```ts
import { verifyMessage, verifyTypedData } from 'eth-signature-verifier'

// EIP-191 or personal_sign
verifyMessage(
  '0x742d35Cc1C3c72AE4d5e4F0e3D1E3c7E5E8C1A2B',
  'Hello World',
  '0x...'
)

// EIP-712 typed data
verifyTypedData(
  '0x742d35Cc1C3c72AE4d5e4F0e3D1E3c7E5E8C1A2B',
  '0x...',
  { name: 'MyApp', version: '1', chainId: 1 },
  { Message: [{ name: 'content', type: 'string' }] },
  { content: 'Hello World' }
)
```

## Using with ethers or viem

This library accepts types from popular Ethereum libraries without requiring them as dependencies:

```ts
import { verifyTypedData } from 'eth-signature-verifier'
import type { TypedDataDomain } from 'ethers'
import type { TypedData } from 'viem'

// With ethers types
const ethersDomain: TypedDataDomain = { /* ... */ }
const ethersTypes = { /* ... */ }
verifyTypedData(address, signature, ethersDomain, ethersTypes, value)

// With viem types  
const viemDomain = { /* ... */ }
const viemTypes: TypedData = { /* ... */ }
verifyTypedData(address, signature, viemDomain, viemTypes, value)
```

**Note:** Only TypeScript types are supported - no runtime dependencies are added to your bundle.

## Why not ethers.js?

Most apps don't need 2MB+ of dependencies just to verify a signature. This library does one thing well:

* No bundler bloat
* Works in browser or server
* Ideal for serverless, bots, RPC gateways, and minimal dapps

## Examples

### Express Middleware

```ts
import { verifyMessage } from 'eth-signature-verifier'

const auth = (req, res, next) => {
  const { address, message, signature } = req.headers
  if (!verifyMessage(address, message, signature)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }
  req.user = { address }
  next()
}
```

### MetaMask Verification

```ts
const message = 'Sign to authenticate'
const signature = await ethereum.request({
  method: 'personal_sign',
  params: [message, account]
})

const isValid = verifyMessage(account, message, signature)
```

### EIP-712 Permit

```ts
const domain = {
  name: 'MyToken',
  version: '1',
  chainId: 1,
  verifyingContract: '0x...'
}

const types = {
  Permit: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'deadline', type: 'uint256' }
  ]
}

verifyTypedData(owner, signature, domain, types, permit)
```

## API

### `verifyMessage(address, message, signature): boolean`

Verifies a raw message signed via `personal_sign` or `eth_sign`.

### `verifyTypedData(address, signature, domain, types, value): boolean`

Verifies EIP-712 structured data signatures. All parameters must match the original signed payload.

Returns `false` if the signature is invalid or mismatched.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for setup and contribution flow.

## License

MIT © [Zak Cole](https://github.com/zscole)
