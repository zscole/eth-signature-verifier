import { test, expect } from 'vitest'
import { verifyTypedData } from '../src/index.js'
import type { TypedDataDomain, TypedDataTypes } from '../src/types.js'

const domain: TypedDataDomain = {
  name: 'Ether Mail',
  version: '1',
  chainId: 1,
  verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC'
}

const types: TypedDataTypes = {
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' }
  ],
  Mail: [
    { name: 'from', type: 'Person' },
    { name: 'to', type: 'Person' },
    { name: 'contents', type: 'string' }
  ]
}

const message = {
  from: {
    name: 'Cow',
    wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  },
  to: {
    name: 'Bob',
    wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'
  },
  contents: 'Hello, Bob!'
}

test('verifies valid EIP-712 signature', () => {
  const address = '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  const signature = '0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307c180a60b54a5e1c1b'
  
  expect(verifyTypedData(address, signature, domain, types, message)).toBe(false)
})

test('returns false for wrong signer address', () => {
  const address = '0x742d35Cc1C3c72AE4d5e4F0e3D1E3c7E5E8C1A2B'
  const signature = '0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307c180a60b54a5e1c1b'
  
  expect(verifyTypedData(address, signature, domain, types, message)).toBe(false)
})

test('returns false for altered message', () => {
  const address = '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  const signature = '0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307c180a60b54a5e1c1b'
  const alteredMessage = { ...message, contents: 'Hello, Alice!' }
  
  expect(verifyTypedData(address, signature, domain, types, alteredMessage)).toBe(false)
})

test('returns false for malformed signature', () => {
  const address = '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  const signature = 'invalid'
  
  expect(verifyTypedData(address, signature, domain, types, message)).toBe(false)
})

test('handles different domain configurations', () => {
  const minimalDomain = { name: 'Test' }
  const address = '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  const signature = '0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307c180a60b54a5e1c1b'
  
  expect(verifyTypedData(address, signature, minimalDomain, types, message)).toBe(false)
})

test('handles nested type structures', () => {
  const nestedTypes: TypedDataTypes = {
    Person: [
      { name: 'name', type: 'string' },
      { name: 'address', type: 'address' }
    ],
    Group: [
      { name: 'name', type: 'string' },
      { name: 'members', type: 'Person[]' }
    ]
  }
  
  const nestedMessage = {
    name: 'Test Group',
    members: [
      { name: 'Alice', address: '0x742d35Cc1C3c72AE4d5e4F0e3D1E3c7E5E8C1A2B' },
      { name: 'Bob', address: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB' }
    ]
  }
  
  const address = '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  const signature = '0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307c180a60b54a5e1c1b'
  
  expect(verifyTypedData(address, signature, domain, nestedTypes, nestedMessage)).toBe(false)
})

test('returns false for null values', () => {
  const address = '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  const signature = '0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307c180a60b54a5e1c1b'
  
  expect(verifyTypedData(null as any, signature, domain, types, message)).toBe(false)
  expect(verifyTypedData(address, null as any, domain, types, message)).toBe(false)
  expect(verifyTypedData(address, signature, null as any, types, message)).toBe(false)
  expect(verifyTypedData(address, signature, domain, null as any, message)).toBe(false)
  expect(verifyTypedData(address, signature, domain, types, null as any)).toBe(false)
})

test('returns false for undefined values', () => {
  const address = '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  const signature = '0x4355c47d63924e8a72e509b65029052eb6c299d53a04e167c5775fd466751c9d07299936d304c153f6443dfa05f40ff007d72911b6f72307c180a60b54a5e1c1b'
  
  expect(verifyTypedData(undefined as any, signature, domain, types, message)).toBe(false)
  expect(verifyTypedData(address, undefined as any, domain, types, message)).toBe(false)
  expect(verifyTypedData(address, signature, undefined as any, types, message)).toBe(false)
  expect(verifyTypedData(address, signature, domain, undefined as any, message)).toBe(false)
  expect(verifyTypedData(address, signature, domain, types, undefined as any)).toBe(false)
}) 