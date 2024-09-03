import service from '@/utils/request';

export const beginGameReq = () => {
  return service<any>({
    url: '/api/game/begin',
    method: 'GET',
  });
};

export const endGameReq = (data: any) => {
  return service<any>({
    url: '/api/game/end',
    method: 'POST',
    data
  });
};


export const recordGameReq = (params: any) => {
  return service<any>({
    url: '/api/game/record',
    method: 'GET',
    params
  });
};
export const addgasGameReq = () => {
  return service<any>({
    url: '/api/game/addgas',
    method: 'GET',
  });
};
