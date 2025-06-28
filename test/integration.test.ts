import { describe, test, expect } from 'vitest'
import { verifyMessage, verifyTypedData } from '../src/index.js'
import type { TypedDataDomain, TypedDataTypes } from '../src/types.js'
import { REAL_SIGNATURE_DATA, MOCK_SIGNATURE, MOCK_ADDRESS } from './helpers/fixtures.js'

describe('integration tests', () => {
  test('verifies real MetaMask personal_sign signature', () => {
    expect(verifyMessage(
      REAL_SIGNATURE_DATA.address,
      REAL_SIGNATURE_DATA.message,
      REAL_SIGNATURE_DATA.signature
    )).toBe(true)
  })

  test('handles case insensitive addresses', () => {
    const addressLower = '0x663918f51479a1dd832929199296843d09d0f71a'
    const addressUpper = '0x663918F51479A1DD832929199296843D09D0F71A'
    const addressMixed = '0x663918f51479A1DD832929199296843d09d0F71a'
    const message = 'Hello from fresh test'
    const signature = '0xda689ba088beb48ceafea291888c4ad87f6cb3d9b2e45a4e8bf742b56ff8fa2f3f5fa686956810fe30171761489282af3a6e8047fd74591f81f822477be21e771b'

    expect(verifyMessage(addressLower, message, signature)).toBe(true)
    expect(verifyMessage(addressUpper, message, signature)).toBe(true)
    expect(verifyMessage(addressMixed, message, signature)).toBe(true)
  })

  test('rejects tampered signatures', () => {
    const address = '0x663918f51479a1dd832929199296843d09d0f71a'
    const message = 'Hello from fresh test'
    const originalSignature = '0xda689ba088beb48ceafea291888c4ad87f6cb3d9b2e45a4e8bf742b56ff8fa2f3f5fa686956810fe30171761489282af3a6e8047fd74591f81f822477be21e771b'
    
    // Tamper with the last byte
    const tamperedSignature = originalSignature.slice(0, -2) + '1c'

    expect(verifyMessage(address, message, originalSignature)).toBe(true)
    expect(verifyMessage(address, message, tamperedSignature)).toBe(false)
  })

  test('handles complex EIP-712 structure', () => {
    const domain: TypedDataDomain = {
      name: 'DeFi Protocol',
      version: '2',
      chainId: 1,
      verifyingContract: '0xa0b86a33e6d03b0b43e0b5a8ff4e5b1c3d2e4f5a'
    }

    const types: TypedDataTypes = {
      Order: [
        { name: 'trader', type: 'address' },
        { name: 'token', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
        { name: 'nonce', type: 'uint256' }
      ]
    }

    const value = {
      trader: '0x8ba1f109551bD432803012645Hac136c',
      token: '0xA0b86a33E6D03b0b43e0B5A8FF4e5B1C3D2E4F5A',
      amount: '1000000000000000000',
      deadline: 1640995200,
      nonce: 42
    }

    const address = '0x8ba1f109551bD432803012645Hac136c'
    const signature = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b'

    // This will return false since it's not a real signature, but shouldn't throw
    expect(verifyTypedData(address, signature, domain, types, value)).toBe(false)
  })

  test('handles edge case messages', () => {
    const address = '0x8ba1f109551bD432803012645Hac136c'
    const signature = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1b'

    const testCases = [
      '', // empty
      ' ', // single space
      '\n', // newline
      'a'.repeat(1000), // very long
      '🚀💎👏', // emojis only
      JSON.stringify({ complex: 'object' }), // JSON string
      'Line 1\nLine 2\nLine 3' // multiline
    ]

    for (const message of testCases) {
      // Should not throw, just return false for invalid signatures
      expect(() => verifyMessage(address, message, signature)).not.toThrow()
      expect(verifyMessage(address, message, signature)).toBe(false)
    }
  })

  test('handles malformed inputs gracefully', () => {
    const address = '0x663918f51479a1dd832929199296843d09d0f71a'
    const message = 'test'

    const malformedSignatures = [
      '', // empty
      '0x', // just prefix
      '0x123', // too short
      'notahex', // not hex
      '0x' + 'z'.repeat(130), // invalid hex chars
      '0x' + '1'.repeat(131), // wrong length (odd)
      '0x' + '1'.repeat(130) // wrong length (too short)
    ]

    for (const sig of malformedSignatures) {
      expect(verifyMessage(address, message, sig)).toBe(false)
    }
  })
}) 