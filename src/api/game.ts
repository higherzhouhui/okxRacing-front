import service from '@/utils/request';

export const beginGameReq = () => {
  return service<any>({
    url: '/game/begin',
    method: 'GET',
  });
};

export const endGameReq = (data: any) => {
  return service<any>({
    url: '/game/end',
    method: 'POST',
    data
  });
};


export const recordGameReq = (params: any) => {
  return service<any>({
    url: '/game/record',
    method: 'GET',
    params
  });
};


export const addgasGameReq = () => {
  return service<any>({
    url: '/game/addgas',
    method: 'GET',
  });
};


export const levelListReq = () => {
  return service<any>({
    url: '/levellist/list',
    method: 'GET',
  });
};
