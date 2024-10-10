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

  const copy = () => {
    handleCopyLink(link)

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
          <span>Recommend your friend</span>
        </div>
        <div className='intro'>
          Successfully invited, you can receive a reward of {systemConfig?.invite_friends_score?.toLocaleString()} points each time.
        </div>
        <div className='label'>
          <img src='/assets/frens/type.png' />
          <span>Get point rewards</span>
        </div>
        <div className='intro'>Invited friends will contribute {systemConfig?.invite_friends_ratio}% of their points to you.</div>
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
    <div className={`page-bottom maxWidth ${isH5PcRoot && 'h5Pc'}`}>
      <Button color="default" style={{ fontWeight: 'bold', height: '50px', borderRadius: '100px', flex: 1, background: 'var(--btnBg)', color: '#fff', border: 'none', fontSize: '1.4rem' }} onClick={() => handleShare()}>👆🏻 Invite frens</Button>
      <Button color="default" className="copy" onClick={() => copy()} style={{ borderRadius: '100px', height: '50px', padding: '0 15px' }}>
        {
          isCopy ? <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3786" width="18" height="18"><path d="M416.832 798.08C400.64 798.08 384.512 791.872 372.16 779.52L119.424 525.76C94.784 500.992 94.784 460.8 119.424 436.032 144.128 411.264 184.128 411.264 208.768 436.032L416.832 644.928 814.4 245.76C839.04 220.928 879.04 220.928 903.744 245.76 928.384 270.528 928.384 310.656 903.744 335.424L461.504 779.52C449.152 791.872 432.96 798.08 416.832 798.08Z" fill="#2F68C5" p-id="3787"></path></svg> : <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2452" width="18" height="18"><path d="M878.272 981.312H375.36a104.64 104.64 0 0 1-104.64-104.64V375.36c0-57.792 46.848-104.64 104.64-104.64h502.912c57.792 0 104.64 46.848 104.64 104.64v502.912c-1.6 56.192-48.448 103.04-104.64 103.04z m-502.912-616.96a10.688 10.688 0 0 0-10.944 11.008v502.912c0 6.208 4.672 10.88 10.88 10.88h502.976c6.208 0 10.88-4.672 10.88-10.88V375.36a10.688 10.688 0 0 0-10.88-10.944H375.36z" fill="#2F68C5" p-id="2453"></path><path d="M192.64 753.28h-45.312a104.64 104.64 0 0 1-104.64-104.64V147.328c0-57.792 46.848-104.64 104.64-104.64h502.912c57.792 0 104.64 46.848 104.64 104.64v49.92a46.016 46.016 0 0 1-46.848 46.912 46.08 46.08 0 0 1-46.848-46.848v-49.984a10.688 10.688 0 0 0-10.944-10.944H147.328a10.688 10.688 0 0 0-10.944 10.88v502.976c0 6.208 4.672 10.88 10.88 10.88h45.312a46.08 46.08 0 0 1 46.848 46.912c0 26.496-21.824 45.248-46.848 45.248z" fill="#2F68C5" p-id="2454"></path></svg>
        }
      </Button>
    </div>
    <BackTop />
  </div>
}

export default FrensPage;