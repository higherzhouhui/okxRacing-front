import './index.scss';
import { FC, useEffect, useRef, useState } from 'react';
import { getMagicPrizeReq, getRewardFarmingReq, getUserInfoReq, startFarmingReq } from '@/api/common';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfoAction } from '@/redux/slices/userSlice'
import { initUtils } from '@telegram-apps/sdk';
import moment from 'moment';
import { Button, Popup, Toast } from 'antd-mobile';
import { handleCopyLink, judgeIsStartFarming } from '@/utils/common';
import { useNavigate } from 'react-router-dom';
import EventBus from '@/utils/eventBus';

export const HomePage: FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userInfo = useSelector((state: any) => state.user.info);
  const systemConfig = useSelector((state: any) => state.user.system);
  const link = `${systemConfig.tg_link}?startapp=${btoa(userInfo.user_id)}`
  const [isShowRules, setShowRules] = useState(false)
  const [isSleep, setIsSleep] = useState(true)
  const [showAddScore, setShowScore] = useState(false)
  const [isGettingScore, setGetScore] = useState(false)
  const farmingTimer = useRef<any>(null)
  const shakingTimer = useRef<any>(null)
  const eventBus = EventBus.getInstance()
  const utils = initUtils()
  const [isShowInvite, setShowInvite] = useState(false)
  const [isShowCongrate, setShowCongrates] = useState(false)
  const [isGetBigReward, setGetBigReward] = useState(false)
  const messageList = [
    'Invite friends to get more $CAT!',
    `I've got lots of surprises ready, but i can't tell yet!`,
    `What fun tasks are updated today? Go check!`,
    `Cat...Cat,my $CAT!`,
    'Need a web3 wallet? I love portkey wallet!',
    'Ticket will be reset at 00:00 UTC!',
  ]
  const [currentMessage, setCurrentMessage] = useState(0)
  const [typeStr, setTypeStr] = useState('')
  const [farmObj, setFarmObj] = useState({
    score: 0,
    canFarming: true,
    percent: 0,
    leftTime: 180,
  })

  const handleStartFarming = async () => {
    const res = await startFarmingReq()
    dispatch(setUserInfoAction(res.data))
  }

  const getRewardFarming = async () => {
    if (isGettingScore) {
      return
    }
    if (!farmObj.canFarming) {
      setGetScore(true)
      const res = await getRewardFarmingReq()
      setTimeout(() => {
        setGetScore(false)
      }, 1500);
      setShowScore(true)
      if (res.code == 0) {
        dispatch(setUserInfoAction(res.data))
      }
    }
  }

  const handleHarvest = async () => {
    if (farmObj.score == 1080) {
      setShowCongrates(true)
      eventBus.emit('showCongrates', { time: 3000, visible: true })
      await getRewardFarming()
    }
  }

  const handlePlayGame = async () => {
    if (navigator.vibrate) {
      navigator.vibrate(500)
    }
    if (userInfo.ticket) {
      navigate('/game')
    } else {
      setShowInvite(true)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMessage((val) => val + 1)
    }, 10000);
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const index = currentMessage % messageList.length
    const str = messageList[index]
    let i = 1
    const timer = setInterval(() => {
      i = Math.min(str.length, i + 1)
      setTypeStr(str.slice(0, i))
      if (i == str.length) {
        clearInterval(timer)
      }
    }, 50);
    const hideTimer = setTimeout(() => {
      setTypeStr('')
    }, 5000);
    return () => {
      clearInterval(timer)
      clearTimeout(hideTimer)
    }
  }, [currentMessage])

  useEffect(() => {
    let timer
    if (isShowCongrate) {
      timer = setTimeout(() => {
        setShowCongrates(false)
      }, 3000);
    }
    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [isShowCongrate])

  const selfHandleCopyLink = () => {
    handleCopyLink(link)
  }

  const handleSendLink = () => {
    const text = `Hey, if you're a Hamster, DOGS, Blum or Catizen user... you have something very special to claim in the Cat app now.\nThe Cat airdrop is coming! 🪂\nClaim with this link.`
    utils.shareURL(link, text)
  }

  const handleTouchCat = async () => {
    if (userInfo.ticket) {
      setIsSleep(false)
    } else {
      setIsSleep(false)
      const isGetBigRewardDay = localStorage.getItem('isGetBigRewardDay') || false
      const today = moment().format('YYYY-MM-DD')
      let flag = false
      if (isGetBigRewardDay) {
        if (isGetBigRewardDay == today) {
          flag = true
        }
      }
      if (!flag) {
        const res: any = await getMagicPrizeReq()
        if (res.code == 0) {
          setShowCongrates(true)
          setGetBigReward(true)
          eventBus.emit('showCongrates', { time: 3000, visible: true })
          dispatch(setUserInfoAction(res.data))
          localStorage.setItem('isGetBigRewardDay', today)
        }
      }
    }
  }
  useEffect(() => {
    let timer
    if (!isSleep) {
      timer = setTimeout(() => {
        setIsSleep(true)
      }, 5000);
    }
    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [isSleep])

  useEffect(() => {
    let timer
    if (showAddScore) {
      timer = setTimeout(() => {
        setShowScore(false)
      }, 1500);
    }
    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [showAddScore])


  useEffect(() => {
    getUserInfoReq({}).then(res => {
      if (res.code == 0) {
        dispatch(setUserInfoAction(res.data.userInfo))
      }
    })
  }, [])

  useEffect(() => {
    if (farmingTimer.current) {
      clearInterval(farmingTimer.current)
    }
    if (userInfo.end_farm_time && userInfo.last_farming_time) {
      const data = judgeIsStartFarming(userInfo.end_farm_time, userInfo.last_farming_time)
      setFarmObj(data)
      farmingTimer.current = setInterval(() => {
        const data = judgeIsStartFarming(userInfo.end_farm_time, userInfo.last_farming_time)
        setFarmObj(data)
      }, 1000)
    }
    return () => {
      clearInterval(farmingTimer.current)
      if (shakingTimer.current) {
        clearInterval(shakingTimer.current)
      }
    }
  }, [userInfo])
  return (
    <div className="home-page fadeIn">
      <div className='top-title'>
        <div className='score'>{userInfo?.score?.toLocaleString()}</div>
        <div className='unit'>
          <img src='/assets/common/cat.webp' alt='unit' />
          <span>$CAT</span>
        </div>
        <div className={`add-score ${showAddScore ? 'fadeOut' : ''}`}>
          + {userInfo.farm_reward_score}
        </div>
      </div>
      <div className='tree' onClick={() => getRewardFarming()}>
        {
          farmObj.canFarming ? <img src='/assets/home/start.gif' alt='tree' /> : farmObj.percent != 100 ? <img src={`/assets/home/${isGettingScore ? 'progress' : 'shake'}.gif`} alt='tree' /> : <img src='/assets/home/full.gif' alt='tree' />
        }
      </div>
      <div className='btn-container'>
        <div className='btn-bot'>
          <div className='progress' style={{ width: farmObj.percent + '%' }} />
          {
            farmObj.canFarming ? <div className='btn-bot-content' onClick={() => handleStartFarming()}>
              Start Farming
            </div> : <div className={`btn-bot-farming ${farmObj.score == 1080 ? 'btn-bot-farmed' : ''}`} onClick={() => handleHarvest()}>
              <span className='btn-farming'>{
                farmObj.score == 1080 ?
                  <div className='harvest-wrapper'>
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8689" width="16" height="16"><path d="M648.743382 404.237493c121.111302 123.798399 170.182811 274.361137 109.637824 336.270999l-2.473836 2.38853-2.921685 2.516488-3.369534 2.665771-3.83871 2.83638-4.265233 2.964337-4.713083 3.113621-5.182259 3.262903-5.608782 3.412187-9.255556 5.39552-6.739069 3.774732-10.96165 5.95-11.942653 6.269893-12.966309 6.611112-9.191578 4.585126-14.651077 7.144266-26.657709 12.667743-17.316847 8.061291-31.136204 14.139248-41.052871 18.169895-45.083517 19.513442-40.647674 17.274195-43.441401 18.191221-46.277783 19.108245-69.437999 28.32115-52.974198 21.326167-102.856103 40.796957a38.173839 38.173839 0 0 1-41.415416-8.914338l-37.83262-38.66434a40.263803 40.263803 0 0 1-8.743728-42.332442l26.998927-71.293375 37.875272-98.505565 23.629393-60.523662 25.911293-65.386027 24.162547-59.798572 19.300181-46.768284 15.098926-35.82796 14.181901-32.970254 10.705736-24.31183 10.129929-22.47778 7.22957-15.674733 9.106274-19.257529 6.461828-13.264875 6.141936-12.219894 5.822044-11.174911 7.250897-13.328855 3.412186-5.971326 4.84104-8.103944 3.028316-4.819713 2.921685-4.350539 2.751075-3.924014 2.623119-3.454839 2.452509-2.985664 2.345878-2.537813c60.566314-61.909862 207.823496-11.729392 328.934798 112.111659z" fill="#CF411C" p-id="8690"></path><path d="M634.945352 418.035523c-112.602161-115.097323-246.445184-161.993563-298.353074-115.012018l-2.55914 2.473835-1.663441 1.748746-1.962008 2.345878-2.217921 2.921685-2.452509 3.454839-2.665771 3.987993-2.772402 4.414517-4.649104 7.741398-3.220251 5.630108-7.080288 12.987636-5.67276 10.940324-6.035305 12.027958-6.376524 13.030288-9.042295 19.086919-7.144266 15.504123-10.065951 22.328497-10.620431 24.162547-14.139248 32.842297-15.034948 35.678677-19.257529 46.640327-24.098568 59.670615-25.889967 65.300723-23.58674 60.438357-37.83262 98.42026-26.998928 71.272049a20.537099 20.537099 0 0 0 2.72975 19.534769l1.706093 1.983334 37.811294 38.643014c4.798388 4.926345 11.686739 6.824373 18.127242 5.224911l2.409857-0.767742 102.749472-40.775631 52.888893-21.283515 69.395347-28.278497 46.171152-19.065593 43.356097-18.148568 40.519717-17.231543 44.934233-19.449464 40.882262-18.105916 30.986921-14.07527 17.167564-7.975986 26.465773-12.582439 14.501793-7.080287 9.063621-4.499821 12.753048-6.504481 11.708066-6.141936 10.705735-5.822044 6.483155-3.625448 8.95699-5.203585 5.331542-3.241577 4.819714-3.049642 4.350538-2.857706 3.817384-2.644445 3.305555-2.409857 2.72975-2.153943 2.175269-1.83405 2.025986-1.940681c50.543015-51.673302 4.947671-191.530305-109.637824-308.674939z" fill="#F66E2E" p-id="8691"></path><path d="M336.592278 303.023505c51.90789-46.981546 185.750913-0.085305 298.353074 115.012018 81.636567 83.470617 128.255567 178.457364 130.046965 244.867047l-1.10896 1.023656-2.175269 1.834051-2.72975 2.153943-3.305556 2.431183-3.83871 2.644444-4.329211 2.857707-4.84104 3.049642-5.331542 3.220251-8.95699 5.203584-6.461829 3.625449-10.705735 5.822043-11.729392 6.141936-12.731722 6.504481-9.063621 4.521148-14.501793 7.080287-26.444447 12.582439-17.188891 7.975986-30.98692 14.07527-40.882262 18.105916-44.934233 19.449464-40.519717 17.210217-43.356098 18.148568-46.171151 19.086919-69.374021 28.257171-52.888893 21.304841-102.792125 40.775631-69.864522 31.605379-9.810037-10.023298-1.684767-1.962008a20.515773 20.515773 0 0 1-3.497492-17.018281l0.767742-2.516488 26.998928-71.272049 37.83262-98.42026 23.58674-60.438357 25.889967-65.300723 24.098568-59.670615 19.257529-46.640327 15.034948-35.700003 14.139248-32.820971 10.620431-24.162547 10.065951-22.328497 7.144266-15.504123 9.042295-19.086919 6.376524-13.030288 6.035305-12.027958 5.67276-10.940324 7.080288-12.987636 3.198925-5.630108 4.649104-7.741398 2.793728-4.414517 2.665771-3.987993 2.452509-3.454839 2.217921-2.921685 1.962008-2.345878 1.642114-1.748746 2.55914-2.473835z" fill="#FD9816" p-id="8692"></path><path d="M391.933681 285.258808h-2.836381c-22.008604 0.426523-39.66667 6.419176-52.078499 17.380826l-2.985663 2.857706-1.663441 1.748746-1.962008 2.345878-2.217921 2.921685-2.452509 3.454839-2.665771 3.987993-2.772402 4.414517-4.649104 7.741398-3.220251 5.630108-7.080288 12.987636-5.67276 10.940324-6.035305 12.027958-6.376524 13.030288-9.042295 19.086919-7.144266 15.504123-10.065951 22.328497-10.620431 24.162547-14.608424 33.929932 1.535484 9.212904a1018.687012 1018.687012 0 0 0 144.143562 373.805052l7.720072 11.96398 8.359858-3.433513 43.356097-18.148568 10.129929-4.329212-2.985663-7.592115c-70.696243-181.48568-90.29499-380.181576-57.090149-572.436971l0.981004-5.544803zM161.675057 683.418343l-9.703406 24.525092-24.077242 61.696601 3.28423 9.490144a1013.35547 1013.35547 0 0 0 79.397319 170.737292l9.340861 15.696058 9.170252-3.625448 38.579035-15.568102L263.123633 938.351342A1056.519632 1056.519632 0 0 1 166.302835 701.119061l-4.649104-17.700718z" fill="#FFD217" p-id="8693"></path><path d="M319.808584 292.125834c60.566314-61.909862 207.823496-11.729392 328.934798 112.111659 121.111302 123.798399 170.182811 274.361137 109.637824 336.270999-60.566314 61.909862-207.823496 11.729392-328.934798-112.090333-121.132628-123.819725-170.204138-274.382463-109.637824-336.292325z" fill="#CF411C" p-id="8694"></path><path d="M634.945352 418.035523c-114.50019-117.05933-251.008984-163.5717-301.338738-112.090333-50.543015 51.651976-4.947671 191.508978 109.616498 308.653613 114.521516 117.080656 251.008984 163.5717 301.360064 112.111659 50.543015-51.673302 4.947671-191.530305-109.637824-308.674939z" fill="#B03414" p-id="8695"></path><path d="M590.203054 115.310584a9.68208 9.68208 0 0 1 12.369177 6.013979c33.482082 96.436927 15.35484 177.433708-36.297136 248.215256-5.886022 8.061291-12.006632 15.717385-18.596418 23.373479l-8.061291 9.106273-17.700718 18.980289a9.618101 9.618101 0 0 1-13.6914 0.55448 9.895341 9.895341 0 0 1-0.533154-13.862008l17.615414-18.91631 1.27957-1.407527c8.807707-9.810037 16.63441-19.321507 24.077243-29.494089 48.090506-65.897856 64.746243-140.326178 33.610038-230.045362a9.852689 9.852689 0 0 1 5.928675-12.51846z" fill="#17BA55" p-id="8696"></path><path d="M677.149836 535.905247c92.704847-69.54463 183.149121-92.982087 271.140885-44.187818 4.691757 2.601792 6.39785 8.573119 3.838711 13.328854a9.639427 9.639427 0 0 1-13.179572 3.881363c-79.823843-44.273122-162.953241-22.733694-250.241241 42.737638a626.776044 626.776044 0 0 0-35.038893 28.427781l-36.041222 32.053228-2.025985 1.706094a9.618101 9.618101 0 0 1-13.648747-1.428853 9.895341 9.895341 0 0 1 1.428853-13.819357l28.363802-25.250181a689.709562 689.709562 0 0 1 45.403409-37.448749z" fill="#FC5965" p-id="8697"></path><path d="M735.071705 284.448413a9.703406 9.703406 0 0 1 11.68674 7.272223c12.753048 54.381725-20.174554 105.671157-83.662553 156.17152-9.852689 7.826703-20.089249 15.376166-31.200182 23.074913l-19.406812 13.051614-19.577421 12.7957a9.639427 9.639427 0 0 1-13.435485-2.857706 9.895341 9.895341 0 0 1 1.27957-12.326525l1.642115-1.322222 30.219178-19.854661c14.07527-9.490144 26.615056-18.553765 38.493731-28.001258 58.092479-46.192477 87.224022-91.57456 76.774201-136.188901a9.810037 9.810037 0 0 1 7.186918-11.814697z" fill="#FFD217" p-id="8698"></path><path d="M273.232236 239.364897l-0.213262-3.540144a35.870613 35.870613 0 0 0-2.985663-10.876345 44.934234 44.934234 0 0 0-5.67276-9.148926 94.453593 94.453593 0 0 0-11.302869-11.836022l-5.096954-4.414517-16.293191-13.52079c-25.889967-21.710038-36.254484-37.064878-33.71667-56.57832 3.625448-28.171866 17.977959-41.628678 45.382083-42.716312a9.767384 9.767384 0 0 0 9.319535-10.193908 9.746058 9.746058 0 0 0-10.087277-9.426166c-36.915595 1.492832-59.009504 22.179214-63.850544 59.777246-3.497491 26.934949 8.615771 46.533696 36.105201 70.440329l21.880647 18.276525c5.736739 4.947671 9.68208 8.829033 12.433155 12.369177 1.471506 1.855377 2.537814 3.56147 3.220252 5.11828a16.058604 16.058604 0 0 1 1.364874 4.905018c0.895699 8.189248-4.371864 18.169894-15.418818 30.496419l-4.137277 4.39319-13.179571 13.328854-4.926344 5.267564a9.895341 9.895341 0 0 0 1.215591 13.819356c3.604122 3.049642 8.743728 2.985663 12.262546 0.149283l5.694087-5.907348 13.90466-14.053944c15.738711-16.570432 24.397135-30.858963 24.098569-46.128499z" fill="#CF411C" p-id="8699"></path><path d="M742.685147 823.829826l3.518817 0.255914c3.668101 0.405197 7.272223 1.407527 10.748388 3.006989 3.049642 1.407527 6.035305 3.326882 9.042295 5.715413 3.753405 2.985663 7.464158 6.67509 11.68674 11.452151l4.39319 5.139607 13.35018 16.485127c21.454124 26.209859 36.659681 36.659681 55.959862 34.121867 27.830648-3.689427 41.138176-18.19122 42.225811-45.936564a9.746058 9.746058 0 0 1 10.06595-9.404839c5.374194 0.213262 9.532797 4.777061 9.319535 10.193907-1.471506 37.342118-21.944626 59.691941-59.094808 64.618286-26.657709 3.497491-46.021868-8.743728-69.651261-36.55305l-18.063263-22.136561a91.851801 91.851801 0 0 0-12.219894-12.582439 25.356812 25.356812 0 0 0-5.054301-3.241577 15.610754 15.610754 0 0 0-4.84104-1.386201c-8.12527-0.895699-17.977959 4.435843-30.1552 15.610754l-4.371864 4.158603-13.179572 13.35018-3.924014 3.83871a35.081544 35.081544 0 0 1-1.27957 1.151613 9.618101 9.618101 0 0 1-13.648747-1.236917 9.895341 9.895341 0 0 1-0.149283-12.41183l5.843369-5.758065 13.883335-14.07527c16.399822-15.887994 30.496419-24.653049 45.595345-24.354482zM356.318982 1.748746a9.639427 9.639427 0 0 1 13.499464 2.473835c33.524734 48.900901 44.891581 117.848398 13.456811 218.166687a9.68208 9.68208 0 0 1-12.155915 6.39785 9.831363 9.831363 0 0 1-6.333872-12.326524c29.579393-94.410941 19.236203-157.045893-10.918997-201.063102a9.895341 9.895341 0 0 1 2.452509-13.648746zM709.821524 203.089087a19.620074 19.620074 0 0 1 19.364159 19.812009 19.620074 19.620074 0 0 1-19.364159 19.833335 19.620074 19.620074 0 0 1-19.406812-19.833335 19.620074 19.620074 0 0 1 19.406812-19.833335z" fill="#FD9816" p-id="8700"></path><path d="M477.217022 222.901096a19.620074 19.620074 0 0 1 19.385486 19.833335 19.620074 19.620074 0 0 1-19.406812 19.790683 19.620074 19.620074 0 0 1-19.36416-19.812009 19.620074 19.620074 0 0 1 19.385486-19.833335z" fill="#FC5965" p-id="8701"></path><path d="M787.34214 539.957219a19.620074 19.620074 0 0 1 19.385486 19.812009 19.620074 19.620074 0 0 1-19.385486 19.812009 19.620074 19.620074 0 0 1-19.385485-19.833336 19.620074 19.620074 0 0 1 19.406811-19.790682z" fill="#17BA55" p-id="8702"></path><path d="M903.633728 282.358449a19.620074 19.620074 0 0 1 19.406812 19.812009 19.620074 19.620074 0 0 1-19.406812 19.812009 19.620074 19.620074 0 0 1-19.364159-19.833335 19.620074 19.620074 0 0 1 19.364159-19.812009z" fill="#CF411C" p-id="8703"></path><path d="M453.736912 81.359327l-13.307528-12.561113 17.679392-4.051971c18.041937-4.158603 35.038892-17.807349 46.917567-37.662011l11.644088-19.449464 0.55448 22.776346c0.575807 23.288174 8.637098 43.782621 22.221866 56.620973l13.328854 12.539786-17.679392 4.051972c-18.041937 4.179929-35.060218 17.807349-46.917567 37.683337l-11.644087 19.449464-0.554481-22.797673c-0.575807-23.266848-8.637098-43.782621-22.243192-56.599646zM895.231218 576.16905l8.40251-16.421149 8.423836 16.421149c8.594445 16.741041 25.889967 30.005917 47.727961 36.595702l21.390146 6.440503-21.390146 6.461828c-21.837995 6.589786-39.133516 19.833335-47.727961 36.595702l-8.423836 16.399823-8.40251-16.399823c-8.594445-16.741041-25.889967-30.005917-47.727961-36.595702l-21.390145-6.461828 21.390145-6.440503c21.837995-6.611112 39.133516-19.854661 47.727961-36.595702z" fill="#FFE20D" p-id="8704"></path></svg>
                    &nbsp;&nbsp;Harvest
                  </div> : 'Farming'
              }</span>
              <img src='/assets/common/cat.webp' alt='logo' />
              <span className='btn-number'>{farmObj.score} / 1080</span>
              {
                farmObj.score != 1080 ? <div className='left-time'>{farmObj.leftTime}m</div> : null
              }
            </div>
          }
        </div>
        <div className='btn-top'>
          <div className='btn-top-right'>
            <img src='/assets/home/hint.png' alt='hint' className='hint-img' />
            <img src='/assets/home/cat.gif' className='cat-img' />
            <div className='count'>{userInfo?.ticket}</div>
            <div className='play-now'>Drop Game</div>
            {
              typeStr ? <div className='message'>
                <span>{typeStr}</span>
              </div> : null
            }
          </div>
          <div className='btn-top-middle' onClick={() => handlePlayGame()}>
            <Button size='mini'>Play</Button>
          </div>
          <div className='btn-top-left'>
            <div className='question' onClick={() => setShowRules(true)}>
              <img src='/assets/home/question.png' width={30} />
            </div>
            <div className='anima' onClick={() => handleTouchCat()}>
              {
                isSleep ? <img src="/assets/home/cat-wait.gif" alt="cat" width={80} /> : <img src="/assets/home/cat-touch.gif" alt="cat" width={80} />
              }
            </div>
          </div>
        </div>

      </div>
      <Popup
        visible={isShowRules}
        onMaskClick={() => {
          setShowRules(false)
        }}
        bodyStyle={{
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}
        className='popup-rule'
      >
        <div className='popup-rule-content'>
          <div className='popup-rule-title'>
            <div>Rules</div>
            <svg onClick={() => setShowRules(false)} className="close-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5777" width="18" height="18"><path d="M597.795527 511.488347 813.564755 295.718095c23.833825-23.833825 23.833825-62.47489 0.001023-86.307691-23.832801-23.832801-62.47489-23.833825-86.307691 0L511.487835 425.180656 295.717583 209.410404c-23.833825-23.833825-62.475913-23.833825-86.307691 0-23.832801 23.832801-23.833825 62.47489 0 86.308715l215.769228 215.769228L209.410915 727.258599c-23.833825 23.833825-23.833825 62.47489 0 86.307691 23.832801 23.833825 62.473867 23.833825 86.307691 0l215.768205-215.768205 215.769228 215.769228c23.834848 23.833825 62.475913 23.832801 86.308715 0 23.833825-23.833825 23.833825-62.47489 0-86.307691L597.795527 511.488347z" fill="#fff" p-id="5778"></path></svg>
          </div>
          <div className='popup-rule-wrapper'>
            <div className='popup-rule-content'>
              <div className='popup-rule-content-title'>
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5414" width="16" height="16"><path d="M845.902988 0.000232H178.097244A177.864812 177.864812 0 0 0 0.000232 178.097244v667.805744a177.864812 177.864812 0 0 0 178.097012 178.097012h667.805744a177.864812 177.864812 0 0 0 178.097012-178.097012V178.097244A177.864812 177.864812 0 0 0 845.902988 0.000232zM512.000116 911.615445A75.929234 75.929234 0 1 1 587.929351 835.91841a77.090232 77.090232 0 0 1-75.929235 75.697035z m75.929235-340.172258v51.548287a75.929234 75.929234 0 0 1-151.858469 0v-114.938749a75.697035 75.697035 0 0 1 75.929234-75.929235A84.056217 84.056217 0 1 0 428.176099 348.299473a76.161434 76.161434 0 1 1-152.090669 0 235.914686 235.914686 0 1 1 311.843921 223.375913z" fill="#fff" p-id="5415"></path></svg>
                How to Earn
                <img src='/assets/common/cat.webp' alt='logo' width={16} height={16} />
              </div>
              <ul>
                <li>Check in daily to get <img src='/assets/common/cat.webp' alt='logo' width={16} height={16} /> and an additional <img src='/assets/common/cat.webp' alt='logo' width={16} height={16} /> if you do it consecutively!</li>
                <li>Grow your cat to harvest <img src='/assets/common/cat.webp' alt='logo' width={16} height={16} /> rewards!</li>
                <li>Check in daily to receive <img src='/assets/common/ticket.webp' alt='logo' width={16} height={16} /> and earn more <img src='/assets/common/cat.webp' alt='logo' width={16} height={16} />.</li>
                <li>Invite frens to earn more <img src='/assets/common/cat.webp' alt='logo' width={16} height={16} />.</li>
                <li>
                  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3174" data-spm-anchor-id="a313x.search_index.0.i5.2b3c3a81TUgFeH" width="16" height="16"><path d="M42.666667 896l938.666667 0-469.333333-810.666667-469.333333 810.666667zM554.666667 768l-85.333333 0 0-85.333333 85.333333 0 0 85.333333zM554.666667 597.333333l-85.333333 0 0-170.666667 85.333333 0 0 170.666667z" fill="#ecc115" p-id="3175" data-spm-anchor-id="a313x.search_index.0.i0.2b3c3a81TUgFeH" ></path></svg>
                  &nbsp;<img src='/assets/common/ticket.webp' alt='logo' width={16} height={16} /> will be reset at 8:00 AM (UTC+8) every day!</li>
                <li>
                  <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3174" data-spm-anchor-id="a313x.search_index.0.i5.2b3c3a81TUgFeH" width="16" height="16"><path d="M42.666667 896l938.666667 0-469.333333-810.666667-469.333333 810.666667zM554.666667 768l-85.333333 0 0-85.333333 85.333333 0 0 85.333333zM554.666667 597.333333l-85.333333 0 0-170.666667 85.333333 0 0 170.666667z" fill="#ecc115" p-id="3175" data-spm-anchor-id="a313x.search_index.0.i0.2b3c3a81TUgFeH" ></path></svg>
                  &nbsp;Harvest your ripe <img src='/assets/common/cat.webp' alt='logo' width={16} height={16} /> within 6 hours!</li>
              </ul>
            </div>
          </div>
        </div>
      </Popup>
      <Popup
        visible={isShowInvite}
        onMaskClick={() => {
          setShowInvite(false)
        }}
        bodyStyle={{
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}
        className='popup-invite'
      >
        <div className='popup-frens'>
          <div className='title'>
            Invite a Fren
            <svg onClick={() => setShowInvite(false)} className="close-svg" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5777" width="18" height="18"><path d="M597.795527 511.488347 813.564755 295.718095c23.833825-23.833825 23.833825-62.47489 0.001023-86.307691-23.832801-23.832801-62.47489-23.833825-86.307691 0L511.487835 425.180656 295.717583 209.410404c-23.833825-23.833825-62.475913-23.833825-86.307691 0-23.832801 23.832801-23.833825 62.47489 0 86.308715l215.769228 215.769228L209.410915 727.258599c-23.833825 23.833825-23.833825 62.47489 0 86.307691 23.832801 23.833825 62.473867 23.833825 86.307691 0l215.768205-215.768205 215.769228 215.769228c23.834848 23.833825 62.475913 23.832801 86.308715 0 23.833825-23.833825 23.833825-62.47489 0-86.307691L597.795527 511.488347z" fill="#fff" p-id="5778"></path></svg>
          </div>
          <div className='content'>
            <div className='content-desc'>
              <div>Get {systemConfig?.invite_normalAccount_score} <img src='/assets/common/cat.webp' />and {systemConfig?.invite_normalAccount_ticket} <img src='/assets/common/ticket.webp' />（Invite a Friend）</div>
              <div>Get {systemConfig?.invite_premiumAccount_score} <img src='/assets/common/cat.webp' />and {systemConfig?.invite_premiumAccount_ticket} <img src='/assets/common/ticket.webp' />（Invite a Telegram Premium）</div>
            </div>
            <div className='popup-content-btn' onClick={() => selfHandleCopyLink()}>Copy link</div>
            <div className='popup-content-btn btn-send' onClick={() => handleSendLink()}>Send</div>
          </div>
        </div>
      </Popup>
      {
        isShowCongrate ? <div className='full-congrate fadeIn' onClick={() => setShowCongrates(false)}>
          <div className='full-congrate-content'>
            <div className='full-congrate-score'>+ {isGetBigReward ? systemConfig?.special_reward : systemConfig?.farm_score}<img src='/assets/common/cat.webp' /></div>
            <div className='full-congrate-desc'>{isGetBigReward ? 'Mysterious Grand Prize' : 'Congratulations on farming 1080 $CAT'}</div>
          </div>
        </div> : null
      }
    </div>
  )
}

export default HomePage
