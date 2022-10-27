const config = require("./config");

Date.prototype.yyyymmdd = function () {
  var mm = this.getMonth() + 1; // getMonth() is zero-based
  var dd = this.getDate();

  return [
    this.getFullYear(),
    (mm > 9 ? "" : "0") + mm,
    (dd > 9 ? "" : "0") + dd,
  ].join("");
};

const date = new Date();

module.exports = {
  mockStockData: {
    code: config.pinCode,
    account: config.spotAccount,
    buysell: "B",
    market: "VN", // Only support "VN" and "VNFE"
    ordertype: "LO",
    price: 25000,
    quantity: 300,
    instrumentid: "SSI",
    validitydate: date.yyyymmdd(),
    channel: "IW",
    extOrderID: "", // this property is unique in day.
    session: "",
    twoFaType: 0,
    startDate: "20/10/2022",
    endDate: "27/10/2022",
  },
  mockDerivativeData: {
    account: "1577926",
    buysell: "B",
    currency: "KVND",
    market: "VNFE",
    ordertype: "LO", // Only support "VN" and "VNFE"
    price: 1425,
    quantity: 10,
    instrumentid: "VN30F2209",
    validitydate: date.yyyymmdd(),
    channel: "WT",
    extOrderID: "",
    stoporder: false,
    stopprice: 800,
    stoptype: "D",
    stopstep: 0.5,
    lossstep: 0,
    profitstep: 0,
    session: "",
    code: config.pinCode,
    querySummary: true,
    startDate: "20/10/2022",
    endDate: "27/10/2022",
  },
};
