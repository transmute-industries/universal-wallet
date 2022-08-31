import { passwordToKey } from "./passwordToKey";

import { X25519KeyPair } from "@transmute/x25519-key-pair";
import { X25519KeyAgreementKey2020 }
  from '@digitalcredentials/x25519-key-agreement-key-2020';

//import { JWE } from "@transmute/jose-ld";
import { Cipher } from '@digitalcredentials/minimal-cipher';

export const lockContents = async (
  password: string,
  contents: any[]
): Promise<any[]> => {
  const derivedKey = await passwordToKey(password);

  const kp = await X25519KeyPair.generate({
    secureRandom: () => {
      return derivedKey;
    }
  });
  console.log('key:');
  const key = await kp.export({
    type: "X25519KeyAgreementKey2019",
    privateKey: false
  });
  console.log(key);

  const kak = await X25519KeyAgreementKey2020.fromX25519KeyAgreementKey2019(key);
  console.log('kak:');
  console.log(kak);

  const recipient = {
    header: {
      kid: kak.id,
      alg: "ECDH-ES+A256KW"
    }
  };

  console.log('recipient:');
  console.log(recipient);

  const recipients = [recipient];

  const keyResolver = async (searchKey) => {
    console.log('keyResolver');
    console.log(searchKey);
    if (kak.id === searchKey.id) {
      return kak;
    }
    throw new Error(`Key ${id} not found`);
  };

  const cipher = new Cipher({version: "fips"});

  const encryptedContents = await Promise.all(
    contents.map(async content => {
      // spreading to avoid mutation of function args.
      const jwe = await cipher.encryptObject({
        obj: { ...content },
        recipients: [...recipients],
        keyResolver: keyResolver
      });
      return jwe;
    })
  );

  return encryptedContents;
};
