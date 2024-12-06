import { useEffect, useState } from 'react'
import './index.scss'
import { getSubTotalAndListReq } from '@/api/common'
import { Button, DotLoading, InfiniteScroll, Skeleton } from 'antd-mobile'
import { useSelector } from 'react-redux'
import { initUtils } from '@telegram-apps/sdk'
import { handleCopyLink } from '@/utils/common'
import BackTop from '@/components/BackTop'

const InfiniteScrollContent = ({ hasMore }: { hasMore?: boolean }) => {
  return (
    <>
      {hasMore ? (
        <>
          <span>Loading</span>
          <DotLoading />
        </>
      ) : (
        <span>--- Go invite friends quickly ---</span>
      )}
    </>
  )
}

function FrensPage() {
  const userInfo = useSelector((state: any) => state.user.info);
  const systemConfig = useSelector((state: any) => state.user.system);
  const utils = initUtils()
  const [isCopy, setIsCopy] = useState(false)
  const link = `${systemConfig?.tg_link}?startapp=${btoa(userInfo.user_id)}`;
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState<any>({})
  const [data, setData] = useState([])
  const [hasMore, setHasMore] = useState(true)
  const [isH5PcRoot, setH5PcRoot] = useState(false)
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
    let _link = link
    if (localStorage.getItem('h5PcRoot') == '1') {
      _link = `${location.host}?startParam=${btoa(userInfo.user_id)}`
    }
    handleCopyLink(_link)
    setIsCopy(true)
    setTimeout(() => {
      setIsCopy(false)
    }, 3000);
  }

  const loadMore = async () => {
    setLoading(true)
    const res = await getSubTotalAndListReq({ page })
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
      setTotal(res.data.total)
      setPage(p => p + 1)
      const _hasMore = list.length == 10 ? true : false
      setHasMore(_hasMore)
    }
  }
  useEffect(() => {
    if (localStorage.getItem('h5PcRoot') == '1') {
      setH5PcRoot(true)
    }
  }, [])
  return <div className='frens-page fadeIn'>
    <div className='page-top'>
      <div className='title'>
        Invite friends and receive<span>Extra Points</span>
      </div>
      <div className='desc-content'>
        <div className='label'>
          <img src='/assets/frens/type.png' />
          <span>Refer your friends</span>
        </div>
        <div className='intro'>
          Each successful referral will award you with {systemConfig?.invite_friends_score?.toLocaleString()} points.
        </div>
        <div className='label'>
          <img src='/assets/frens/type.png' />
          <span>Get more points</span>
        </div>
        <div className='intro'>
          Each referred friend will contribute {systemConfig?.invite_friends_ratio}% of their points to you.</div>
      </div>
      <div className='frens-title'>
        Your <span>{total?.user}</span> friends contributed <span>{Number(total?.score)?.toLocaleString()}</span> points to you.
      </div>
      <div className='list'>
        {
          loading ? [...Array(8)].map((_item, index) => {
            return <Skeleton className='custom-skeleton' key={index} animated />
          }) : null
        }
        {
          data.map((item: any, index: number) => {
            return <div key={index} className='list-item'>
              <div className='li-left'>{item.from_username}</div>
              <div className='li-right'>
                <img src='/assets/common/score.png' />
                <span>+{Number(item?.total_score).toLocaleString()}&nbsp;Pts</span>
              </div>
            </div>
          })
        }
      </div>
      <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
        <InfiniteScrollContent hasMore={hasMore} />
      </InfiniteScroll>
    </div>
    <div className='page-bottom'>
      <Button color="default" className='touch-btn' style={{ height: '3rem', borderRadius: '100px', flex: 1, background: 'var(--btnBg)', color: '#fff', border: 'none', fontSize: '1.4rem' }} onClick={() => handleShare()}>👆🏻 Invite Frens</Button>
      <div className='copy touch-btn' onClick={() => handleCopy()}>
          <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2252" width="16" height="16"><path d="M337.28 138.688a27.968 27.968 0 0 0-27.968 27.968v78.72h377.344c50.816 0 92.032 41.152 92.032 91.968v377.344h78.656a28.032 28.032 0 0 0 27.968-28.032V166.656a28.032 28.032 0 0 0-27.968-27.968H337.28z m441.408 640v78.656c0 50.816-41.216 91.968-92.032 91.968H166.656a92.032 92.032 0 0 1-91.968-91.968V337.28c0-50.816 41.152-92.032 91.968-92.032h78.72V166.656c0-50.816 41.152-91.968 91.968-91.968h520c50.816 0 91.968 41.152 91.968 91.968v520c0 50.816-41.152 92.032-91.968 92.032h-78.72zM166.656 309.312a27.968 27.968 0 0 0-27.968 28.032v520c0 15.424 12.544 27.968 27.968 27.968h520a28.032 28.032 0 0 0 28.032-27.968V337.28a28.032 28.032 0 0 0-28.032-28.032H166.656z" p-id="2253" ></path></svg>
        </div>
    </div>
    <BackTop />
  </div>
}

export default FrensPage;