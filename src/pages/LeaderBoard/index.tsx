import { getUserInfoReq, getUserListReq } from "@/api/common"
import { setUserInfoAction } from "@/redux/slices/userSlice"
import { formatNumber, stringToColor } from "@/utils/common"
import { InfiniteScroll, List } from "antd-mobile"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import BackTop from "@/components/BackTop"
import './index.scss'
import { useNavigate } from "react-router-dom"
export default function LeaderBoard() {
  const userInfo = useSelector((state: any) => state.user.info);
  const [total, setTotal] = useState('10.00M')
  const [holderList, setHolderList] = useState<any[]>([])
  const [rank, setRank] = useState(1)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  async function loadMore() {
    const append = await getList()
    if (page == 1) {
      if (append.length < 20) {
        setHasMore(false)
      }
      setHolderList(append)
    } else {
      setHolderList(val => [...val, ...append])
      setHasMore(append.length > 0)
    }
  }
  const getList = async () => {
    const res = await getUserListReq({ page })
    setTotal(formatNumber(res.data.count))
    setPage((page => page + 1))
    setRank(res.data.rank)
    return res.data.rows
  }

  useEffect(() => {
    getUserInfoReq({}).then(res => {
      if (res.code == 0) {
        dispatch(setUserInfoAction(res.data.userInfo))
      }
    })
  }, [])

  return <div className="LeaderBoard fadeIn">
    <div className="title">Telegram Wall of Fame</div>
    <div className="myself" onClick={() => navigate('/frens-detail?myself=true')}>
      <div className="left">
        <div className="icon" style={{ background: stringToColor(userInfo?.username) }}>
          {userInfo?.username?.slice(0, 2)}
        </div>
        <div className="name-score-warpper">
          <div className="name">{userInfo?.username}</div>
          <div className="name-score">{userInfo?.score?.toLocaleString()}&nbsp;TOMATO</div>
        </div>
      </div>
      <div className="right">
        {
          rank == 1 ? <img src='/assets/first.png' alt="first" /> : rank == 2 ? <img src='/assets/second.png' alt="second" /> : rank == 3 ? <img src='/assets/third.png' alt="third" /> : `#${rank}`
        }
      </div>
    </div>
    <div className="holders">
      <div className="holder-title">{total}&nbsp;holders</div>
      <List>
        {
          holderList.map((item, index) => {
            return <List.Item key={index}>
              <ListItem {...{ ...item, rank: index + 1 }} />
            </List.Item>
          })
        }
      </List>
      <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />
    </div>
  </div>
}

function ListItem({ username, score, rank }: { username: string, score: number, rank: number }) {
  return <div className="holders-item">
    <div className="holders-left">
      <div className="icon" style={{ background: stringToColor(username) }}>
        {
          username.slice(0, 2)
        }
      </div>
      <div className="name-score-wrapper">
        <div className="name">{username}</div>
        <div className="name-score">{score.toLocaleString()}&nbsp;TOMATO</div>
      </div>
    </div>
    <div className="right">
      {
        rank == 1 ? <img src='/assets/first.png' alt="first" /> : rank == 2 ? <img src='/assets/second.png' alt="second" /> : rank == 3 ? <img src='/assets/third.png' alt="third" /> : <span>#{rank}</span>
      }
    </div>
    <BackTop scrollName={'content'} />
  </div>
}