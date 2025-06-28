import { describe, test, expect } from 'vitest'
import { hashPersonalMessage, hashTypedData } from '../src/utils.js'
import type { TypedDataDomain, TypedDataTypes } from '../src/types.js'

describe('hashPersonalMessage', () => {
  test('hashes simple message correctly', () => {
    const message = 'Hello World'
    const expected = '0xa1de988600a42c4b4ab089b619297c17d53cffae5d5120d82d8a92d0bb3b78f2'
    
    expect(hashPersonalMessage(message)).toBe(expected)
  })

  test('hashes empty message', () => {
    const message = ''
    const expected = '0x5f35dce98ba4fba25530a026ed80b2cecdaa31091ba4958b99b52ea1d068adad'
    
    expect(hashPersonalMessage(message)).toBe(expected)
  })

  test('hashes message with unicode characters', () => {
    const message = 'Hello 🌍'
    // This will have a different hash due to unicode encoding
    const result = hashPersonalMessage(message)
    
    expect(result).toMatch(/^0x[a-f0-9]{64}$/)
    expect(result).not.toBe(hashPersonalMessage('Hello'))
  })

  test('hashes long message', () => {
    const message = 'a'.repeat(1000)
    const result = hashPersonalMessage(message)
    
    expect(result).toMatch(/^0x[a-f0-9]{64}$/)
  })
})

describe('hashTypedData', () => {
  const domain: TypedDataDomain = {
    name: 'Test App',
    version: '1',
    chainId: 1
  }

  const types: TypedDataTypes = {
    Message: [
      { name: 'content', type: 'string' },
      { name: 'timestamp', type: 'uint256' }
    ]
  }

  const value = {
    content: 'Hello World',
    timestamp: 1234567890
  }

  test('produces consistent hash for same input', () => {
    const hash1 = hashTypedData(domain, types, value)
    const hash2 = hashTypedData(domain, types, value)
    
    expect(hash1).toBe(hash2)
    expect(hash1).toMatch(/^0x[a-f0-9]{64}$/)
  })

  test('produces different hash for different values', () => {
    const alteredValue = { ...value, content: 'Hello, Alice!' }
    
    const originalHash = hashTypedData(domain, types, value)
    const alteredHash = hashTypedData(domain, types, alteredValue)
    
    expect(originalHash).not.toBe(alteredHash)
  })

  test('produces different hash for different domains', () => {
    const alteredDomain = { ...domain, name: 'Altered Mail' }
    
    const originalHash = hashTypedData(domain, types, value)
    const alteredHash = hashTypedData(alteredDomain, types, value)
    
    expect(originalHash).not.toBe(alteredHash)
  })

  test('handles minimal domain', () => {
    const minimalDomain: TypedDataDomain = { name: 'Test' }
    const simpleTypes: TypedDataTypes = {
      Message: [{ name: 'content', type: 'string' }]
    }
    const simpleValue = { content: 'test' }
    
    const result = hashTypedData(minimalDomain, simpleTypes, simpleValue)
    
    expect(result).toMatch(/^0x[a-f0-9]{64}$/)
  })

  test('handles uint256 type', () => {
    const numberTypes: TypedDataTypes = {
      Data: [
        { name: 'amount', type: 'uint256' },
        { name: 'timestamp', type: 'uint256' }
      ]
    }
    
    const numberValue = {
      amount: 1000000000000000000,
      timestamp: 1609459200
    }
    
    const result = hashTypedData(domain, numberTypes, numberValue)
    
    expect(result).toMatch(/^0x[a-f0-9]{64}$/)
  })

  test('handles bool type', () => {
    const boolTypes: TypedDataTypes = {
      Flags: [
        { name: 'enabled', type: 'bool' },
        { name: 'verified', type: 'bool' }
      ]
    }
    
    const boolValue = {
      enabled: true,
      verified: false
    }
    
    const result = hashTypedData(domain, boolTypes, boolValue)
    
    expect(result).toMatch(/^0x[a-f0-9]{64}$/)
  })

  test('handles bytes type', () => {
    const bytesTypes: TypedDataTypes = {
      Data: [
        { name: 'payload', type: 'bytes' }
      ]
    }
    
    const bytesValue = {
      payload: '0x1234567890abcdef'
    }
    
    const result = hashTypedData(domain, bytesTypes, bytesValue)
    
    expect(result).toMatch(/^0x[a-f0-9]{64}$/)
  })

  test('throws on missing type definition', () => {
    const incompleteTypes: TypedDataTypes = {
      Mail: [
        { name: 'from', type: 'Person' }
      ]
      // Missing Person type definition
    }
    
    const incompleteValue = {
      from: { name: 'Test', wallet: '0xabc' }
    }
    
    expect(() => hashTypedData(domain, incompleteTypes, incompleteValue)).toThrow()
  })

  test('throws on missing value field', () => {
    const incompleteValue = {
      content: value.content
      // Missing timestamp
    }
    
    expect(() => hashTypedData(domain, types, incompleteValue)).toThrow()
  })

  test('throws on empty types', () => {
    const emptyTypes: TypedDataTypes = {}
    
    expect(() => hashTypedData(domain, emptyTypes, {})).toThrow('No primary type found')
  })
}) 