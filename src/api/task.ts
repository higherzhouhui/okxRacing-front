import service from '@/utils/request';

export const taskListReq = () => {
  return service<any>({
    url: '/api/task/list',
    method: 'GET',
  });
};



export const handleTakReq = (data: any) => {
  return service<any>({
    url: '/api/task/handle',
    method: 'POST',
    data,
  });
};