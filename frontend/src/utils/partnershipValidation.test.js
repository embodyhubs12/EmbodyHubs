import { describe,expect,it } from 'vitest';
import { isValidGln,isValidNpi,partnershipErrorStep,partnershipIssueForStep,STATE_TAX_ID_PATTERN } from './partnershipValidation';

describe('partnership identifier validation',()=>{
  it('uses an HTML pattern compatible with the Unicode v regex mode',()=>{
    expect(new RegExp(`^(?:${STATE_TAX_ID_PATTERN})$`,'v').test('CA-1234567')).toBe(true);
  });

  it('accepts valid NPI and GLN check digits',()=>{
    expect(isValidNpi('1104465236')).toBe(true);
    expect(isValidGln('1234567890128')).toBe(true);
  });

  it('rejects identifiers with invalid check digits before submission',()=>{
    expect(isValidNpi('1104465235')).toBe(false);
    expect(isValidGln('1234567890127')).toBe(false);
    expect(partnershipIssueForStep({npi:'1104465235',gln:'1234567890128',deaExpirationDate:'2099-12-31'},2)?.field).toBe('npi');
  });

  it('maps server validation errors back to the relevant application step',()=>{
    expect(partnershipErrorStep({gln:['Enter a valid GLN.']})).toBe(2);
    expect(partnershipErrorStep({licenses:['Add the state pharmacy license.']})).toBe(3);
    expect(partnershipErrorStep({declarationAccuracy:['Required']})).toBe(6);
  });
});
