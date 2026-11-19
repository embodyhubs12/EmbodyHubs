const PHARMACY_APPLICANTS=new Set(['LICENSED_PHARMACY','PHARMACY_ORGANIZATION']);
export const STATE_TAX_ID_PATTERN='[A-Za-z0-9\\-]{2,32}';

export function isValidNpi(value){
  const npi=String(value||'').trim();
  if(!/^\d{10}$/.test(npi))return false;
  const payload=`80840${npi.slice(0,9)}`;
  let sum=0;let double=true;
  for(let index=payload.length-1;index>=0;index-=1){
    let digit=Number(payload[index]);
    if(double){digit*=2;if(digit>9)digit-=9}
    sum+=digit;double=!double;
  }
  return(10-(sum%10))%10===Number(npi[9]);
}

export function isValidGln(value){
  const gln=String(value||'').trim();
  if(!/^\d{13}$/.test(gln))return false;
  let sum=0;
  for(let index=0;index<12;index+=1)sum+=Number(gln[index])*(index%2===0?1:3);
  return(10-(sum%10))%10===Number(gln[12]);
}

export function minimumCredentialExpiration(){
  const date=new Date();
  date.setHours(0,0,0,0);
  date.setMonth(date.getMonth()+6);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}

export function partnershipIssueForStep(data,step){
  if(step===2){
    if(!isValidNpi(data.npi))return{field:'npi',step:2,message:'Enter a valid 10-digit NPI, including its check digit.'};
    if(!isValidGln(data.gln))return{field:'gln',step:2,message:'Enter a valid 13-digit GLN, including its check digit.'};
    if(!data.deaExpirationDate||data.deaExpirationDate<minimumCredentialExpiration())return{field:'deaExpirationDate',step:2,message:'DEA registration must remain valid for at least six months.'};
  }
  if(step===3&&PHARMACY_APPLICANTS.has(data.applicantType)){
    const pharmacyLicense=data.licenses?.find(item=>item.holderType==='PHARMACY');
    if(!pharmacyLicense)return{field:'licenses',step:3,message:'Add a state pharmacy license before continuing.'};
    if(!pharmacyLicense.expirationDate)return{field:'licenses',step:3,message:'Enter the state pharmacy license expiration date.'};
  }
  if(step===5&&!data.partnershipInterests?.length)return{field:'partnershipInterests',step:5,message:'Choose at least one partnership interest.'};
  return null;
}

const FIELD_STEPS={
  applicantType:0,firstName:0,middleName:0,lastName:0,preferredName:0,professionalEmail:0,phone:0,stateOfResidence:0,professionalRole:0,yearsExperience:0,
  organizationName:1,organizationWebsite:1,organizationRole:1,pharmacyLegalName:1,pharmacyDbaName:1,pharmacyType:1,pharmacyWebsite:1,pharmacyPhone:1,pharmacyPhysicalAddress:1,
  npi:2,federalEin:2,stateTaxId:2,gln:2,nabpIdentifier:2,deaRegistrationNumber:2,deaExpirationDate:2,
  licenses:3,enterpriseType:4,primaryWholesaler:4,secondaryWholesaler:4,pharmacySoftware:4,hoursOfOperation:4,numberOfLocations:4,
  statesServed:5,onlineOrders:5,shipsHealthcareProducts:5,dispensesPrescriptions:5,dispensesControlledSubstances:5,prescriptionFulfillment:5,otcFulfillment:5,pharmacistCollaboration:5,collaborationAreas:5,partnershipInterests:5,partnershipModel:5,shippingCapability:5,geographicCoverage:5,collaborationDescription:5,
  declarationAccuracy:6,declarationNoRelationship:6,declarationVerification:6,declarationContact:6,declarationNoPhi:6,privacyAcknowledged:6,turnstileToken:6,website:6
};

export function partnershipErrorStep(errors){
  if(!errors||typeof errors!=='object')return null;
  const field=Object.keys(errors).find(key=>Array.isArray(errors[key])?errors[key].length:Boolean(errors[key]));
  return field===undefined?null:(FIELD_STEPS[field]??null);
}
