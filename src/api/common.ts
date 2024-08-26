import service from '@/utils/request';

export const loginReq = (data: any) => {
  return service<any>({
    url: '/user/login',
    method: 'POST',
    data,
  });
};

export const h5PcLoginReq = (data: any) => {
  return service<any>({
    url: '/user/h5PcLogin',
    method: 'POST',
    data,
  });
};


export const updateUserReq = (data: any) => {
  return service<any>({
    url: '/user/update',
    method: 'POST',
    data,
  });
};

export const getUserListReq = (params: any) => {
  return service<any>({
    url: '/user/list',
    method: 'GET',
    params,
  });
};

export const getSubUserListReq = (params: any) => {
  return service<any>({
    url: '/user/subList',
    method: 'GET',
    params,
  });
};
export const getMyScoreHistoryReq = (params: any) => {
  return service<any>({
    url: '/user/getMyScoreHistory',
    method: 'GET',
    params,
  });
};


export const getSubUserTotalReq = () => {
  return service<any>({
    url: '/user/subTotal',
    method: 'GET',
  });
};


export const getUserInfoReq = (params: any) => {
  return service<any>({
    url: '/user/userInfo',
    method: 'GET',
    params,
  });
};

export const userCheckReq = () => {
  return service<any>({
    url: '/user/check',
    method: 'POST',
  });
};


export const bindWalletReq = (data: any) => {
  return service<any>({
    url: '/user/bindWallet',
    method: 'POST',
    data,
  });
};


export const getCheckInRewardListReq = () => {
  return service<any>({
    url: '/checkInReward/list',
    method: 'GET',
  });
};

export const startFarmingReq = () => {
  return service<any>({
    url: '/user/startFarming',
    method: 'GET',
  });
};

export const getRewardFarmingReq = () => {
  return service<any>({
    url: '/user/getRewardFarming',
    method: 'GET',
  });
};

export const getMagicPrizeReq = () => {
  return service<any>({
    url: '/user/getMagicPrize',
    method: 'GET',
  });
};


export const getSystemConfigReq = () => {
  return service<any>({
    url: '/system/getConfig',
    method: 'GET'
  })
}
