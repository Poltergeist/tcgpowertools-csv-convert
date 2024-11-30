#!/usr/bin/env node
const fs = require("fs");
const papa = require("papaparse");
const ordersPath = process.argv[2];
const outputPath = process.argv[3] || "./";
const countryCode = {
  D: "DEU",
  AT: "AT",
};

if (outputPath[outputPath.length - 1] !== "/") {
  outputPath += "/";
}
if (!fs.existsSync(outputPath)) {
  console.log("Invalid output path")
  process.exit(1)
}

function replaceNonLatinChars(str) {
  const charMap = {
    // Polish
    'Ł': 'L', 'ł': 'l',
    'Ą': 'A', 'ą': 'a',
    'Ć': 'C', 'ć': 'c',
    'Ę': 'E', 'ę': 'e',
    'Ń': 'N', 'ń': 'n',
    'Ś': 'S', 'ś': 's',
    'Ź': 'Z', 'ź': 'z',
    'Ż': 'Z', 'ż': 'z',

    // German (excluding Latin-1)
    'ß': 'ss',

    // French (excluding Latin-1)
    'Œ': 'OE', 'œ': 'oe',
    'Ÿ': 'Y', 'ÿ': 'y',

    // Spanish (excluding Latin-1)
    'Ñ': 'N', 'ñ': 'n',

    // Other European characters
    'Č': 'C', 'č': 'c',
    'Š': 'S', 'š': 's',
    'Ž': 'Z', 'ž': 'z',
    'Đ': 'Dj', 'đ': 'dj',
    'ě': 'e', 'Ě': 'E',
    'Ď': 'D', 'ď': 'd',
    'Ň': 'N', 'ň': 'n',
    'Ť': 'T', 'ť': 't',
    'Ő': 'O', 'ő': 'o',
    'Ű': 'U', 'ű': 'u',
    'Ğ': 'G', 'ğ': 'g',
    'Ş': 'S', 'ş': 's',
    'İ': 'I', 'ı': 'i',
    'ė': 'e', 'Ė': 'E',

    // Scandinavian (excluding Latin-1)
    'Ø': 'O', 'ø': 'o',
    'Æ': 'AE', 'æ': 'ae',

    // some more signs
    'º': 'o',
  };

  return str.split('').map(char => charMap[char] || char).join('');
}


papa.parse(fs.readFileSync(ordersPath, { encoding: "utf8" }).toString(), {
  delimiter: ",",
  header: true,
  complete: function (results) {
    const data = results.data.reduce((acc, cur) => {
      if (acc[cur.shippingMethod] == null) {
        acc[cur.shippingMethod] = [
          {
            NAME: "Philipp Hinrichsen",
            ZUSATZ: "",
            STRASSE: "Kollaustrasse 4",
            NUMMER: "",
            PLZ: "22529",
            STADT: "Hamburg",
            LAND: "DEU",
            ADRESS_TYP: "HOUSE",
            REFERENZ: cur.idorder,
          },
        ];
      }
      acc[cur.shippingMethod] = [
        ...acc[cur.shippingMethod],
        {
          NAME: replaceNonLatinChars(cur.shippingAddressName),
          ZUSATZ: replaceNonLatinChars(cur.shippingAddressExtra) || "",
          STRASSE: replaceNonLatinChars(cur.shippingAddressStreet),
          NUMMER: "",
          PLZ: replaceNonLatinChars(cur.shippingAddressZip),
          STADT: replaceNonLatinChars(cur.shippingAddressCity),
          LAND:
            countryCode[cur.shippingAddressCountry] ||
            cur.shippingAddressCountry,
          ADRESS_TYP: "HOUSE",
          REFERENZ: cur.idOrder,
        },
      ];
      return acc;
    }, {});
    const date = Date.now();
    fs.mkdirSync(outputPath + date);
    Object.keys(data).forEach((key) => {
      console.log(key, data[key].length - 1);
      fs.writeFileSync(
        `${outputPath}${date}/${key}.csv`,
        papa.unparse(data[key], { delimiter: ";" }) + "\n",
        "binary"
      );
    });
  },
});
