import { FC, useEffect, useState } from 'react';
import './index.scss'
import { DotLoading, InfiniteScroll, Popup, Skeleton, Tabs } from 'antd-mobile';
import { getSubUserListReq, getUserListReq } from '@/api/common';
import { recordGameReq } from '@/api/game';
import { useSelector } from 'react-redux';
import { initUtils } from '@telegram-apps/sdk';
import { handleCopyLink } from '@/utils/common';
import { Empty } from 'antd-mobile'
import moment from 'moment';
import BackTop from '@/components/BackTop';

const InfiniteScrollContent = ({ hasMore }: { hasMore?: boolean }) => {
  return (
    <>
      {hasMore ? (
        <>
          <span>Loading</span>
          <DotLoading />
        </>
      ) : (
        <span></span>
      )}
    </>
  )
}


function LeaderBoardPage() {
  const [isShowRecord, setShowRecord] = useState(false)
  const [recordList, setRecordList] = useState([])
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  const handlePage = (type: string) => {
    let _page = 1
    const maxPage = Math.ceil(total / pageSize)
    if (type == 'add') {
      _page = Math.min(maxPage, page + 1)
    } else {
      _page = Math.max(1, page - 1)
    }
    setPage(_page)
  }

  const handleShowRecord = () => {
    setPage(1)
    setShowRecord(true)
  }

  const getRecordList = async () => {
    setLoading(true)
    const res = await recordGameReq({ page, pageSize })
    setLoading(false)
    if (res.code == 0) {
      const list = res.data.rows
      list.map((item: any) => {
        item.time = moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss')
      })
      setRecordList(list)
      setTotal(res.data.count)
    }
  }
  useEffect(() => {
    if (isShowRecord) {
      getRecordList()
    }
  }, [page, isShowRecord])
  return <div className='fadeIn leader-page'>
    <div className='title'>Racing Driver<span>Leader Board</span></div>
    <div className='sub-title'>Check your ranking and challenge top drivers!</div>
    <div className='record-btn' onClick={() => handleShowRecord()}>
      <span>My records</span>
      <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2231" width="10" height="10"><path d="M326.7079 958.51045l-63.278185-60.523445L651.328255 512.841158 257.924327 124.944664l66.024739-60.523445 445.672362 448.419939L326.7079 958.51045z" fill="#ffffff" p-id="2232"></path></svg>
    </div>
    <Tabs>
      <Tabs.Tab title='Friends' key='fruits'>
        <CustomList />
      </Tabs.Tab>
      <Tabs.Tab title='Global' key='vegetables'>
        <CustomList type='global' />
      </Tabs.Tab>
    </Tabs>


    <Popup visible={isShowRecord}
      onMaskClick={() => {
        setShowRecord(false)
      }}
      bodyStyle={{
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}
      className='game-record'>
      <div className='game-record-content maxWidth'>
        <div className='game-record-title'>
          Game Record
          <div className='img-wrapper' onClick={() => setShowRecord(false)}><img src="/assets/common/close.png" alt="close" /></div>
        </div>
        <div className='game-lists'>
          {
            loading ? [...Array(5)].map((_item, index) => {
              return <Skeleton className='custom-skeleton' key={index} animated />
            }) : !recordList.length ? <Empty description='No record' /> : null
          }
          {
            recordList.map((item: any) => {
              return <div className='game-list' key={item.createdAt}>
                <div className='game-items'>
                  <div className='game-item'>
                    <div className='game-label'>Currency</div>
                    <div className='game-code'>
                      {
                        item.symbol == 'BTC' ? <svg  viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="6459" width="16" height="16"><path d="M512.46 511.71m-447.5 0a447.5 447.5 0 1 0 895 0 447.5 447.5 0 1 0-895 0Z" fill="#F7931A" p-id="6460"></path><path d="M634.45 513.57l-5.04-1.35c43.06 10.77 87.36-14.81 98.94-58.04a81.8 81.8 0 0 0-58.01-100.48l-36.38-9.75 21.62-80.69-51.87-13.9-21.62 80.69-41.59-11.14 21.66-80.83-51.95-13.92-21.66 80.83-95.21-25.51-15.15 56.55 66.28 17.76-69.3 258.63-66.28-17.76-15.15 56.55 95.21 25.51-22.4 83.6 51.95 13.92 22.4-83.6 41.59 11.14-22.39 83.57 51.87 13.9 22.39-83.57 42.87 11.49c59.07 15.83 119.82-19.24 135.65-78.32s-19.36-119.45-78.43-135.28z m-104.5-138.8l37.46 10.04 24.85 6.66c10.08 2.7 18.32 8 24.8 15.53 11.37 12.31 16.23 30.21 11.59 47.5-4.63 17.29-17.79 30.37-33.79 35.34-9.37 3.28-19.15 3.75-29.24 1.05l-24.85-6.66-37.46-10.04 26.64-99.42z m22.55 273.2c-1.18 0.07-1.9-0.12-2.98-0.41l-48.99-13.13-37.46-10.04 26.64-99.42 37.46 10.04 48.99 13.13c1.08 0.29 1.8 0.48 2.79 1.13 25.64 8.03 40.65 35.6 33.6 61.9-7.05 26.3-33.83 42.67-60.05 36.8z" fill="#FFFFFF" p-id="6461"></path></svg>
                        : <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5381" width="16" height="16"><path d="M512.85 511.04m-447.5 0a447.5 447.5 0 1 0 895 0 447.5 447.5 0 1 0-895 0Z" fill="#255AA8" p-id="5382"></path><path d="M676.92 507.3m-115.38 0a115.38 115.38 0 1 0 230.76 0 115.38 115.38 0 1 0-230.76 0Z" fill="#FFFFFF" p-id="5383"></path><path d="M529.67 284.33m-56.21 0a56.21 56.21 0 1 0 112.42 0 56.21 56.21 0 1 0-112.42 0Z" fill="#FFFFFF" p-id="5384"></path><path d="M529.67 730.27m-56.21 0a56.21 56.21 0 1 0 112.42 0 56.21 56.21 0 1 0-112.42 0Z" fill="#FFFFFF" p-id="5385"></path><path d="M259 310.35c-33.81 33.31-34.13 87.62-0.93 121.39 23.52 23.91 57.49 31.06 87.28 21.46 7.27-2.24 14.39-5.58 20.89-9.98a85.41 85.41 0 0 0 13.22-10.56c0.54-0.48 0.98-1.01 1.46-1.63 33.19-11.73 71.45-4.87 98.72 20.41 0.56 8 3.86 15.8 9.92 21.91 2.82 2.85 5.88 5.11 9.21 6.65 0.93 0.6 1.83 0.95 2.83 1.35 12.55 4.96 27.39 2.34 37.61-7.66 13.83-13.57 14.01-35.79 0.44-49.62-2.98-3.03-6.24-5.36-9.87-7.03l-0.1-0.04c-1.67-0.77-3.47-1.49-5.26-1.96-11.88-3.42-25.1-0.51-34.42 8.69-0.44 0.52-0.94 0.91-1.28 1.47-24.56-0.41-49.02-10.19-67.65-29.15a99.275 99.275 0 0 1-16.15-21.7l0.04-0.1c0.31-6.38-0.24-12.63-1.47-18.92-1.81-9.53-5.2-18.88-10.37-27.54l-0.06-0.14c-3.55-5.7-7.63-11.25-12.68-16.38-33.24-33.67-87.61-34.13-121.38-0.92zM259 704.26c-33.81-33.31-34.13-87.62-0.93-121.39 23.52-23.91 57.49-31.06 87.28-21.46 7.27 2.24 14.39 5.58 20.89 9.98a85.41 85.41 0 0 1 13.22 10.56c0.54 0.48 0.98 1.01 1.46 1.63 33.19 11.73 71.45 4.87 98.72-20.41 0.56-8 3.86-15.8 9.92-21.91 2.82-2.85 5.88-5.11 9.21-6.65 0.93-0.6 1.83-0.95 2.83-1.35 12.55-4.96 27.39-2.34 37.61 7.66 13.83 13.57 14.01 35.79 0.44 49.62-2.98 3.03-6.24 5.36-9.87 7.03l-0.1 0.04c-1.67 0.77-3.47 1.49-5.26 1.96-11.88 3.42-25.1 0.51-34.42-8.69-0.44-0.52-0.94-0.91-1.28-1.47-24.56 0.41-49.02 10.19-67.65 29.15a99.275 99.275 0 0 0-16.15 21.7l0.04 0.1c0.31 6.38-0.24 12.63-1.47 18.92-1.81 9.53-5.2 18.88-10.37 27.54l-0.06 0.14c-3.55 5.7-7.63 11.25-12.68 16.38-33.24 33.66-87.61 34.12-121.38 0.92z" fill="#FFFFFF" p-id="5386"></path></svg>
                      }
                      {item.symbol}
                      </div>
                  </div>
                  <div className='game-item'>
                    <div className='game-label'>Your prediction</div>
                    
                    <div className='game-code'>
                      {item.guessType}
                      {
                        item.guessType == 'Rise' ?  <svg className={`${item.guessType}`} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="695" width="12" height="12"><path d="M833.28 206.208v760.32l135.808 8.96v-904.96h-904.96l8.96 135.68z" p-id="696"></path><path d="M64 975.616h108.672l715.008-715.008-99.584-99.584-715.008 715.008z" p-id="697"></path><path d="M64 975.616h108.672l715.008-715.008-99.584-99.584-715.008 715.008z" p-id="698"></path></svg> 
                        : <svg className={`${item.guessType}`} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="903" width="12" height="12"><path d="M833.28 839.808l-769.28-8.96v144.64h905.088v-904.96l-135.68-9.088z" p-id="904"></path><path d="M64 70.4l9.088 99.584 715.008 715.136 99.584-99.584-715.008-715.008z" p-id="905"></path><path d="M64 70.4l9.088 99.584 715.008 715.136 99.584-99.584-715.008-715.008z" p-id="906"></path></svg>
                      }
                    </div>
                  </div>
                  <div className='game-item'>
                    <div className='game-label'>Result</div>
                    <div className={`game-code ${item.result}`}>{item.result}</div>
                  </div>
                  <div className='game-item'>
                    <div className='game-label'>Win count</div>
                    <div className='game-code'>{item.count}</div>
                  </div>
                </div>
                <div className='game-time'>{item.time}</div>
              </div>
            })
          }
        </div>
        {
          total > pageSize ? <div className='page'>
          <svg onClick={() => handlePage('minus')} className={`${page == 1 ? 'dis' : 'active'}`} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="23965" width="26" height="26"><path d="M496.529 748.638l-180.54-236.26 186.647-236.256a38.17 38.17 0 0 0 8.781-24.048 38.19 38.19 0 0 0-13.743-29.395 38.172 38.172 0 0 0-53.822 4.962L237.36 487.95c-11.581 14.084-11.581 34.392 0 48.474l200.005 260.308a38.166 38.166 0 0 0 53.822 5.727 38.158 38.158 0 0 0 13.848-25.799 38.178 38.178 0 0 0-8.506-28.022z m0 0M520.196 487.95c-11.58 14.084-11.58 34.392 0 48.474l200.006 260.308a38.164 38.164 0 0 0 53.821 5.727 38.172 38.172 0 0 0 5.723-53.822l-180.92-236.26 186.647-236.256a38.17 38.17 0 0 0 8.78-24.048 38.183 38.183 0 0 0-41.682-38.079 38.178 38.178 0 0 0-25.883 13.646L520.196 487.95z m0 0" p-id="23966"></path></svg>
          <svg onClick={() => handlePage('add')} className={`${page == Math.ceil(total / pageSize) ? 'dis' : 'active'}`} viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="22870" width="26" height="26"><path d="M527.471 275.362l180.54 236.26-186.646 236.256a38.17 38.17 0 0 0-8.781 24.048 38.19 38.19 0 0 0 13.743 29.395 38.172 38.172 0 0 0 53.822-4.962L786.641 536.05c11.581-14.084 11.581-34.392 0-48.474L586.635 227.267a38.169 38.169 0 0 0-53.822-5.726 38.158 38.158 0 0 0-13.848 25.799 38.178 38.178 0 0 0 8.506 28.022z m0 0M503.804 536.05c11.58-14.084 11.58-34.392 0-48.474L303.798 227.267a38.17 38.17 0 0 0-53.821-5.726 38.172 38.172 0 0 0-5.723 53.822l180.92 236.26-186.647 236.255a38.17 38.17 0 0 0-8.78 24.048 38.183 38.183 0 0 0 41.682 38.079 38.178 38.178 0 0 0 25.883-13.646L503.804 536.05z m0 0" p-id="22871"></path></svg>
        </div> : null
        }
      </div>
    </Popup>
    <BackTop />
  </div>
}
type CustomListType = {
  type?: string
}
const CustomList: FC<CustomListType> = ({ type }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState<number>(0)
  const [page, setPage] = useState(1)
  const [rank, setRank] = useState(0)
  const pageSize = 20
  const userInfo = useSelector((state: any) => state.user.info);
  const utils = initUtils()
  const systemConfig = useSelector((state: any) => state.user.system);
  const link = `${systemConfig?.tg_link}?startapp=${btoa(userInfo.user_id)}`;
  const [isH5PcRoot, setH5PcRoot] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const handleShare = () => {
    if (isH5PcRoot) {
      const isOpen = window.open(link)
      if (!isOpen) {
        location.href = link
      }
    } else {
      utils.shareURL(link, ``)
    }
  }
  const handleCopy = () => {
   
    handleCopyLink(link)

  }
  const loadMore = async () => {
    setLoading(true)
    let res: any;
    if (type) {
      res = await getUserListReq({ page })
    } else {
      res = await getSubUserListReq({ page: page })
    }
    setLoading(false)
    if (res.code == 0) {
      const list = res.data.rows
      let _data = []
      if (page == 1) {
        _data = list
      } else {
        _data = [...data, ...list]
      }
      setData(_data)
      setTotal(res.data.count)
      setPage(p => p + 1)
      const _hasMore = list.length == pageSize ? true : false
      setHasMore(_hasMore)
      setRank(res.data?.rank || 0)
    }
  }
  useEffect(() => {
    if (localStorage.getItem('h5PcRoot') == '1') {
      setH5PcRoot(true)
    }
  }, [])
  return <div className='custom-list-container'>
    <div className='custom-content'>
      <div className='custom-title'>
        <div className='ct-left'>{total}&nbsp;<span>players</span></div>
        <div className='ct-right'>Total historical points</div>
      </div>
      <div className='custom-lists'>
        {
          type == 'global' ? <div className='custom-title custom-list myself'>
            <div className='ct-left'>
              <div className='ctl-icon'>
                {
                  rank == 1 ? <img src='/assets/NO1.png' /> : rank == 2 ? <img src='/assets/NO2.png' /> : rank == 3 ? <img src='/assets/NO3.png' /> : <span className='order'>#{rank}</span>
                }
              </div>
              <div className='ctl-name'>{userInfo.username}</div>
            </div>
            <div className='ct-right'>
              <img src='/assets/common/score.png' alt='score' />
              <span>{Number(userInfo.score).toLocaleString()}&nbsp;Pts</span>
            </div>
          </div> : null
        }
        {
          data.map((item: any, index) => {
            return <div key={index} className='custom-list'>
              <div className='custom-title custom-list'>
                <div className='ct-left'>
                  <div className='ctl-icon'>
                    {
                      index == 0 ? <img src='/assets/NO1.png' /> : index == 1 ? <img src='/assets/NO2.png' /> : index == 2 ? <img src='/assets/NO3.png' /> : <span className='order'>#{index + 1}</span>
                    }
                  </div>
                  <div className='ctl-name'>{item.username}</div>
                </div>
                <div className='ct-right'>
                  <img src='/assets/common/score.png' alt='score' />
                  <span>{Number(item.score).toLocaleString()}&nbsp;Pts</span>
                </div>
              </div>
            </div>
          })
        }
        {
          loading ? [...Array(8)].map((_item, index) => {
            return <Skeleton className='custom-skeleton' key={index} animated />
          }) : null
        }
        {
          !type ? <div className={`no-frens maxWidth ${isH5PcRoot && 'h5Pc'}`}>
            {
              data.length == 1 ? <div className='no-frens-title'>You haven't invited your friends yet. Now invite them to check the rankings and compete together!</div> : null
            }
            <div className='no-frens-bot'>
              <div className='no-frens-btn' onClick={() => handleShare()}>Invite Frens</div>
              <div className='copy' onClick={() => handleCopy()}>
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2252" width="16" height="16"><path d="M337.28 138.688a27.968 27.968 0 0 0-27.968 27.968v78.72h377.344c50.816 0 92.032 41.152 92.032 91.968v377.344h78.656a28.032 28.032 0 0 0 27.968-28.032V166.656a28.032 28.032 0 0 0-27.968-27.968H337.28z m441.408 640v78.656c0 50.816-41.216 91.968-92.032 91.968H166.656a92.032 92.032 0 0 1-91.968-91.968V337.28c0-50.816 41.152-92.032 91.968-92.032h78.72V166.656c0-50.816 41.152-91.968 91.968-91.968h520c50.816 0 91.968 41.152 91.968 91.968v520c0 50.816-41.152 92.032-91.968 92.032h-78.72zM166.656 309.312a27.968 27.968 0 0 0-27.968 28.032v520c0 15.424 12.544 27.968 27.968 27.968h520a28.032 28.032 0 0 0 28.032-27.968V337.28a28.032 28.032 0 0 0-28.032-28.032H166.656z" p-id="2253" ></path></svg>
              </div>
            </div>
          </div> : null
        }
      </div>
    </div>
    <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
      <InfiniteScrollContent hasMore={hasMore} />
    </InfiniteScroll>
  </div>
}

export default LeaderBoardPage;


