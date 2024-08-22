import {requestContactsPermission} from '../../src/controllers/contacts';

export const cleanPhoneNumber = phoneNumber => {
  const cleanedNumber = phoneNumber?.replace(/\D/g, '').slice(-10);
  return cleanedNumber;
};
export const isContactExist = async phone => {
  const permissionsGranted = await requestContactsPermission();
  if (permissionsGranted) {
    const mobContacts = permissionsGranted.map(contact => ({
      phone: cleanPhoneNumber(contact.phoneNumbers[0]?.number),
      givenName: contact.givenName,
    }));
    const isExist = mobContacts.find(elem => elem.phone == phone);
    if (isExist) {
      return isExist;
    } else {
      return false;
    }
  }
};
