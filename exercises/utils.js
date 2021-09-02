export function getCountryFlag(countryCode) {
  // source: https://medium.com/binary-passion/lets-turn-an-iso-country-code-into-a-unicode-emoji-shall-we-870c16e05aad
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}
