import service from '@/utils/request';

export const loginReq = (data: any) => {
  return service<any>({
    url: '/api/user/login',
    method: 'POST',
    data,
  });
};

export const h5PcLoginReq = (data: any) => {
  return service<any>({
    url: '/api/user/h5PcLogin',
    method: 'POST',
    data,
  });
};


export const updateUserReq = (data: any) => {
  return service<any>({
    url: '/api/user/update',
    method: 'POST',
    data,
  });
};

export const getUserListReq = (params: any) => {
  return service<any>({
    url: '/api/user/list',
    method: 'GET',
    params,
  });
};

export const getSubUserListReq = (params: any) => {
  return service<any>({
    url: '/api/user/subList',
    method: 'GET',
    params,
  });
};
export const getMyScoreHistoryReq = (params: any) => {
  return service<any>({
    url: '/api/user/getMyScoreHistory',
    method: 'GET',
    params,
  });
};


export const getSubUserTotalReq = () => {
  return service<any>({
    url: '/api/user/subTotal',
    method: 'GET',
  });
};


export const getUserInfoReq = (params: any) => {
  return service<any>({
    url: '/api/user/userInfo',
    method: 'GET',
    params,
  });
};

export const userCheckReq = () => {
  return service<any>({
    url: '/api/user/check',
    method: 'POST',
  });
};


export const bindWalletReq = (data: any) => {
  return service<any>({
    url: '/api/user/bindWallet',
    method: 'POST',
    data,
  });
};


export const getCheckInRewardListReq = () => {
  return service<any>({
    url: '/api/checkInReward/list',
    method: 'GET',
  });
};

export const startFarmingReq = () => {
  return service<any>({
    url: '/api/user/startFarming',
    method: 'GET',
  });
};

export const getRewardFarmingReq = () => {
  return service<any>({
    url: '/api/user/getRewardFarming',
    method: 'GET',
  });
};

export const getMagicPrizeReq = () => {
  return service<any>({
    url: '/api/user/getMagicPrize',
    method: 'GET',
  });
};


export const getSystemConfigReq = () => {
  return service<any>({
    url: '/api/system/getConfig',
    method: 'GET'
  })
}

export const getBtcPriceReq = (dev: boolean, symbol: string) => {
  const url = dev ? 'https://api.binance.com/api/v3/ticker/price' : '/binance'
  return service<any>({
    url: url,
    params: { symbol: symbol },
    method: 'GET'
  })
}

