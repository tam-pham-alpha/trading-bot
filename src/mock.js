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
    account: "1577921",
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
    startDate: "24/05/2019",
    endDate: "30/05/2019",
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
    code: "674870",
    querySummary: true,
    startDate: "29/08/2019",
    endDate: "29/08/2019",
  },
};
