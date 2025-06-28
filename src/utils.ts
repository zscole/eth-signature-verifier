import { keccak_256 } from '@noble/hashes/sha3'
import { secp256k1 } from '@noble/curves/secp256k1'
import type { TypedDataDomain, TypedDataTypes } from './types.js'

/**
 * Convert string to UTF-8 bytes (browser compatible)
 */
export const toUtf8Bytes = (str: string): Uint8Array => {
  return new TextEncoder().encode(str)
}

/**
 * Convert hex string to bytes
 */
export const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex
  if (clean.length % 2 !== 0) throw new Error('Invalid hex string')
  
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.substr(i, 2), 16)
  }
  return bytes
}

/**
 * Convert bytes to hex string
 */
export const bytesToHex = (bytes: Uint8Array): string => {
  return '0x' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Concatenate multiple Uint8Arrays
 */
export const concatBytes = (...arrays: Uint8Array[]): Uint8Array => {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

/**
 * Keccak256 hash function
 */
export const keccak256 = (data: Uint8Array | string): string => {
  const bytes = typeof data === 'string' 
    ? new TextEncoder().encode(data) 
    : data
  return bytesToHex(keccak_256(bytes))
}

/**
 * Hash a personal message (for personal_sign/eth_sign)
 */
export const hashPersonalMessage = (message: string): string => {
  const prefix = new Uint8Array([0x19])
  const text = new TextEncoder().encode(`Ethereum Signed Message:\n${message.length}`)
  const messageBytes = new TextEncoder().encode(message)
  return keccak256(concatBytes(prefix, text, messageBytes))
}

/**
 * Recover address from hash and signature
 */
export const recoverAddress = (hash: string, signature: string): string => {
  if (!signature.startsWith('0x') || signature.length !== 132) {
    throw new Error('Invalid signature format')
  }

  const sig = signature.slice(2)
  const r = sig.slice(0, 64)
  const s = sig.slice(64, 128)
  const v = parseInt(sig.slice(128, 130), 16)
  const recoveryId = v >= 27 ? v - 27 : v

  const hashBytes = hexToBytes(hash)
  const sigBytes = concatBytes(hexToBytes(`0x${r}`), hexToBytes(`0x${s}`))
  const signatureObj = secp256k1.Signature.fromCompact(sigBytes)
  const publicKeyPoint = signatureObj.addRecoveryBit(recoveryId).recoverPublicKey(hashBytes)
  const publicKeyBytes = publicKeyPoint.toRawBytes(false)
  
  if (publicKeyBytes.length !== 65 || publicKeyBytes[0] !== 0x04) {
    throw new Error('Invalid public key format')
  }

  const publicKeyForHashing = publicKeyBytes.slice(1)
  const addressHash = keccak_256(publicKeyForHashing)
  const address = '0x' + bytesToHex(addressHash).slice(-40)
  
  return toChecksumAddress(address)
}

/**
 * Convert address to checksum format
 */
export const toChecksumAddress = (address: string): string => {
  const addr = address.toLowerCase().replace('0x', '')
  const hash = keccak256(addr).replace('0x', '')
  
  let result = '0x'
  for (let i = 0; i < addr.length; i++) {
    const hashChar = hash[i]
    const addrChar = addr[i]
    if (hashChar && parseInt(hashChar, 16) >= 8) {
      result += addrChar?.toUpperCase() ?? ''
    } else {
      result += addrChar ?? ''
    }
  }
  
  return result
}

/**
 * Encode a type according to EIP-712 rules
 */
const encodeType = (name: string, types: TypedDataTypes): string => {
  const deps = new Set<string>()
  
  function findDependencies(type: string): void {
    const typeFields = types[type]
    if (typeFields) {
      deps.add(type)
      for (const field of typeFields) {
        const baseType = field.type.replace(/\[\]$/, '')
        if (types[baseType] && !deps.has(baseType)) {
          findDependencies(baseType)
        }
      }
    }
  }
  
  findDependencies(name)
  deps.delete(name)
  
  const sortedDeps = [name, ...Array.from(deps).sort()]
  
  return sortedDeps
    .map(type => {
      const typeFields = types[type]
      if (!typeFields) throw new Error(`Type ${type} not found`)
      return `${type}(${typeFields.map(f => `${f.type} ${f.name}`).join(',')})`
    })
    .join('')
}

/**
 * Hash a type according to EIP-712 
 */
const hashType = (name: string, types: TypedDataTypes): string => {
  return keccak256(encodeType(name, types))
}

/**
 * Encode value according to EIP-712 rules
 */
const encodeValue = (type: string, value: any, types: TypedDataTypes): Uint8Array => {
  if (type === 'address') {
    const addr = value.toLowerCase().replace('0x', '').padStart(40, '0')
    return hexToBytes('0x' + '000000000000000000000000' + addr)
  }
  
  if (type === 'string' || type === 'bytes') {
    return hexToBytes(keccak256(value))
  }
  
  if (type.startsWith('bytes') && type !== 'bytes') {
    return hexToBytes(value.padEnd(66, '0'))
  }
  
  if (type.startsWith('uint') || type.startsWith('int')) {
    const bytes = new Uint8Array(32)
    let bigIntValue = BigInt(value)
    for (let i = 31; i >= 0; i--) {
      bytes[i] = Number(bigIntValue & 0xFFn)
      bigIntValue = bigIntValue >> 8n
    }
    return bytes
  }
  
  if (type === 'bool') {
    const bytes = new Uint8Array(32)
    bytes[31] = value ? 1 : 0
    return bytes
  }
  
  if (types[type]) {
    return hexToBytes(hashStruct(type, value, types))
  }
  
  throw new Error(`Unsupported type: ${type}`)
}

/**
 * Hash struct according to EIP-712
 */
const hashStruct = (name: string, data: Record<string, any>, types: TypedDataTypes): string => {
  const typeHash = hashType(name, types)
  const encodedValues = [hexToBytes(typeHash)]
  
  const typeFields = types[name]
  if (!typeFields) throw new Error(`Type ${name} not found`)
  
  for (const field of typeFields) {
    const value = data[field.name]
    if (value === undefined || value === null) {
      throw new Error(`Missing value for field: ${field.name}`)
    }
    encodedValues.push(encodeValue(field.type, value, types))
  }
  
  return keccak256(concatBytes(...encodedValues))
}

/**
 * Hash typed data according to EIP-712
 */
export const hashTypedData = (
  domain: TypedDataDomain,
  types: TypedDataTypes,
  value: Record<string, any>
): string => {
  const allTypes = {
    EIP712Domain: [
      ...(domain.name !== undefined ? [{ name: 'name', type: 'string' }] : []),
      ...(domain.version !== undefined ? [{ name: 'version', type: 'string' }] : []),
      ...(domain.chainId !== undefined ? [{ name: 'chainId', type: 'uint256' }] : []),
      ...(domain.verifyingContract !== undefined ? [{ name: 'verifyingContract', type: 'address' }] : []),
    ],
    ...types
  }
  
  const primaryType = Object.keys(types)[0]
  if (!primaryType) throw new Error('No primary type found')
  
  const domainSeparator = hashStruct('EIP712Domain', domain, allTypes)
  const structHash = hashStruct(primaryType, value, allTypes)
  
  const prefix = new Uint8Array([0x19, 0x01])
  return keccak256(concatBytes(prefix, hexToBytes(domainSeparator), hexToBytes(structHash)))
}
