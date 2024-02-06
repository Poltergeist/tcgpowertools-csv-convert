const fs = require("fs");
const papa = require("papaparse");
const ordersPath = process.argv[2];
const countryCode = {
  D: "DEU",
  AT: "AT",
};

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
          NAME: cur.shippingAddressName,
          ZUSATZ: cur.shippingAddressExtra || "",
          STRASSE: cur.shippingAddressStreet,
          NUMMER: "",
          PLZ: cur.shippingAddressZip,
          STADT: cur.shippingAddressCity,
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
    fs.mkdirSync("./" + date);
    Object.keys(data).forEach((key) => {
      console.log(key, data[key].length - 1);
      fs.writeFileSync(
        `./${date}/${key}.csv`,
        papa.unparse(data[key], { delimiter: ";" }) + "\n",
        "binary"
      );
    });
  },
});
