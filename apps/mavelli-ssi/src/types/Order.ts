export type OrderStatus =
  | 'WA' //WaitingApproval
  | 'RS' //ReadyToSendExchange
  | 'SD' //SentToExchange
  | 'QU' //QueueInExchange
  | 'PF' //PartiallyFilled
  | 'FF' //FullyFilled
  | 'FFPC' //FullyFilledPartiallyCancelled
  | 'WM' //WaitingModify
  | 'WC' //WaitingCancel
  | 'CL' //Cancelled
  | 'RJ' //Rejected
  | 'EX' //Expired
  | 'SOR' //StopOrderReady
  | 'SOS' //StopOrderSent
  | 'IAV' //PreSessionOrder
  | 'SOI'; //PreSessionstopOrder

export type Side = 'B' | 'S';
export type OrderType =
  | 'LO'
  | 'ATO'
  | 'ATC'
  | 'MP'
  | 'MTL'
  | 'MOK'
  | 'MAK'
  | 'PLO';
export type ChannelType =
  | 'WT' // web trading
  | 'Ma' // Mobile
  | 'Br' // Broker
  | 'IW' // iBoard Web
  | 'Im' // iBoard Mobile
  | "I'm not going" // Trade API
  | 'Vt'; // Pro Trading
export type StopType =
  | 'D' // Down
  | 'U' // Up
  | 'V' // Trailling Up
  | 'E' // Trailling Down
  | 'O' // OCO
  | 'B'; // BullBear

export type NewOrder = {
  instrumentID: string;
  market: 'VN' | 'VNFE';
  buySell: Side;
  orderType: OrderType;
  channelID: ChannelType;
  price: number;
  quantity: number;
  account: string;
  requestID: string;
  stopOrder: boolean;
  stopPrice: number;
  stopType: StopType;
  stopStep: number;
  lossStep: number;
  profitStep: number;
  code: string;
};

export type OrderHistory = {
  uniqueID: string;
  orderID: string;
  buySell: 'B' | 'S';
  price: number;
  quantity: number;
  filledQty: number;
  orderStatus: OrderStatus;
  marketID: 'VN' | 'VNFE';
  inputTime: string;
  modifiedTime: string;
  instrumentID: string;
  orderType: OrderType;
  cancelQty: number;
  avgPrice: number;
  isForceSell: boolean;
  isShortSell: boolean;
};

export type OrderMatchEvent = {
  type: string;
  data: {
    orderId: string;
    instrumentID: string;
    ipAddress: string;
    uniqueID: string;
    notifyID: string;
    buySell: 'B' | 'S';
    matchPrice: number;
    matchQty: number;
    prefix: string;
    account: string;
    matchTime: string;
  };
};

export type OrderUpdateEvent = {
  type: string;
  data: {
    orderID: string;
    notifyID: number;
    instrumentID: string;
    uniqueID: string;
    buySell: Side;
    orderType: OrderType;
    ipAddress: string;
    price: number;
    prefix: string;
    quantity: number;
    marketID: string;
    origOrderId: string;
    account: string;
    cancelQty: number;
    osQty: number;
    filledQty: number;
    avgPrice: number;
    channel: string;
    inputTime: string;
    modifiedTime: string;
    isForceSell: boolean;
    isShortSell: boolean;
    orderStatus: OrderStatus;
    rejectReason: string;
    origRequestID: string;
    stopOrder: boolean;
    stopPrice: number;
    stopType: string;
    stopStep: number;
    profitPrice: number;
  };
};
