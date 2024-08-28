import './index.scss';
import { FC, useEffect, useRef, useState } from 'react';
import { getBtcPriceReq, getMagicPrizeReq, getRewardFarmingReq, getUserInfoReq, startFarmingReq } from '@/api/common';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfoAction } from '@/redux/slices/userSlice'
import { initUtils } from '@telegram-apps/sdk';
import { Button, Popup, Toast } from 'antd-mobile';
import { accordingEthToBtc, handleCopyLink, judgeIsStartFarming } from '@/utils/common';
import { useNavigate } from 'react-router-dom';
import EventBus from '@/utils/eventBus';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

export const HomePage: FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userInfo = useSelector((state: any) => state.user.info);
  const systemConfig = useSelector((state: any) => state.user.system);
  const link = `${systemConfig.tg_link}?startapp=${btoa(userInfo.user_id)}`
  const [isShowRules, setShowRules] = useState(false)
  const [showAddScore, setShowScore] = useState(false)
  const scoreTimer = useRef<any>(null)
  const tokenPriceTimer = useRef<any>(null)
  const eventBus = EventBus.getInstance()
  const utils = initUtils()
  const [isShowInvite, setShowInvite] = useState(false)
  const [isShowCongrate, setShowCongrates] = useState(false)
  const [isVoice, setIsVoice] = useState(false)
  const { isConnected } = useConnectWallet()
  const [oldScore, setOldScore] = useState(0)
  const [tokenPrice, setTokenPrice] = useState('')
  const [isBeginGuess, setBeginGuess] = useState(false)
  const [isAnimation, setIsAnimation] = useState(false)
  const guessTimer = useRef<any>(null)
  const countTimer = useRef<any>(null)
  const [count, setCount] = useState(5)
  const [percent, setPercent] = useState('0.2158')
  const [guessType, setGuessType] = useState('')
  const realPrice = useRef<any>(null)
  const preRealPrice = useRef<any>(null)
  const [isDouDong, setIsDouDong] = useState(false)
  const [symbol, setSymbol] = useState('BTC')
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

  const handleGuess = (type: string) => {
    if (!isDouDong) {
      const douDongVideo = document.getElementById('douDong') as any
      if (douDongVideo) {
        douDongVideo.play()
      }
    }
    if (isAnimation) {
      return
    }
    const raceVideo = document.getElementById('race') as any
    raceVideo.play()

    setBeginGuess(true)
    setIsAnimation(true)
    preRealPrice.current = realPrice.current
    setGuessType(type)
  }

  useEffect(() => {
    if (isBeginGuess) {
      clearTimeout(guessTimer.current)
      clearInterval(countTimer.current)
      guessTimer.current = setTimeout(async () => {
        clearTimeout(guessTimer.current)
        setBeginGuess(false)
        const diff = realPrice.current - preRealPrice.current
        console.log(realPrice, preRealPrice, 11111111)
        let percentPrice: any = diff / preRealPrice.current * 100
        percentPrice = percentPrice.toFixed(4)
        setPercent(percentPrice)
      }, 5000);
      setTimeout(() => {
        clearInterval(countTimer.current)
        setIsAnimation(false)
        tokenPriceTimer.current = setInterval(() => {
          getTokenPrice()
        }, 2000);
      }, 10000);
      let myCount = 5
      setCount(myCount)
      countTimer.current = setInterval(() => {
        myCount--;
        myCount = Math.max(0, myCount)
        setCount(myCount)
      }, 1000);
    }
  }, [isBeginGuess])

  const handleWallet = () => {
    if (isConnected) {
      navigate('/assets')
    } else {
      navigate('/wallet')
    }
  }

  useEffect(() => {
    getUserInfoReq({}).then(res => {
      if (res.code == 0) {
        dispatch(setUserInfoAction(res.data.userInfo))
      }
    })
  }, [])

  useEffect(() => {
    if (userInfo?.is_New) {
      // 展示规则
    }
    if (userInfo && userInfo.score) {
      const userScore = userInfo.score
      if (userScore != oldScore) {
        clearInterval(scoreTimer.current)
        let score = oldScore
        scoreTimer.current = setInterval(() => {
          score += Math.round((userScore - oldScore) / 50)
          if (score >= userScore) {
            clearInterval(scoreTimer.current)
            setOldScore(userScore)
          } else {
            setOldScore(score)
          }
        }, 50)
      }
    }

  }, [userInfo])

  const getTokenPrice = async () => {
    try {
      const res: any = await getBtcPriceReq(`${symbol}USDT`)
      let price = res.price.substring(0, 8)
      realPrice.current = res.price
      price = `${price.substring(0, 2)},${price.substring(2)}`
      setTokenPrice(price)
      return res.price
    } catch (error) {
      console.error(error)
      return error?.current || 0
    }
  }

  useEffect(() => {
    getTokenPrice()
    tokenPriceTimer.current = setInterval(() => {
      getTokenPrice()
    }, 2000);
    return () => clearInterval(tokenPriceTimer.current)
  }, [])


  return (
    <div className="home-page fadeIn">
      <div className='race-bg'>
        <img src='/assets/home/race.png' alt='race' className='race-img' />
        <video src='/assets/home/doudong.webm' className='doudong' muted id='douDong' loop />
        <video src='/assets/home/race.mp4' className='doudong' id='race' muted={!isVoice} />
        <div className={`ybp-container ${isBeginGuess ? 'ybp-container-active' : ''}`}>
          <div className='ybp-inner'>
            <div className='price-title'>
              <span>{symbol} Price</span>
              {
                isAnimation ? <span>$<span className='token-price'>{tokenPrice}</span></span> : null
              }
            </div>
            {
              isAnimation ? isBeginGuess ? <NumberRotateWrapper /> : <div className='speed-wrapper'>
                {
                  parseFloat(percent) > 0 ? <img className='rotate-item-img' src='/assets/home/up.png' /> : parseFloat(percent) == 0 ? <img className='rotate-item-img' src="/assets/home/right-arrow.png" alt="arrow" /> : <img className='rotate-item-img' src="/assets/home/down.png" alt="down" />
                }
                {
                  percent.split('').map((item, index) => {
                    return (
                      item == '.' ? <div className='dot' key={index}>.</div> : item == '-' ? null : <div className='ybpNumber-wrapper' key={index}>{item}</div>
                    )
                  })
                }
                <div className='percent'>%</div>
              </div> : <div className='price'>
                $<span>{tokenPrice}</span>
              </div>
            }
            <div className='chance'>
              <span>⛽️</span>
              <div className='progress-wrapper'>
                <div className='progress' style={{ width: '50%' }}></div>
              </div>
              <div className='change-number'><span>9&nbsp;/&nbsp;</span><span>10</span></div>
              <div className='more'>
                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5328" width="12" height="12"><path d="M749.6 466.4l-384-384-91.2 91.2L613.6 512l-339.2 338.4 91.2 91.2 384-384 44.8-45.6z" p-id="5329" fill="#bfbfbf"></path></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className='operation-btns'>
        <div className='operation-title'>Guess the {symbol} price in 5 seconds</div>
        <div className='btns'>
          <div className='btn' onClick={() => handleGuess('Rise')}>Rise</div>
          <div className='btn' onClick={() => handleGuess('Fail')}>Fall</div>
        </div>
        <div className='tktj' onClick={() => navigate('/terms')}>Terms and Conditions</div>
      </div>
      <div className='main-content'>
        <div className='top-btn'>
          <div className='top-btn-left' onClick={() => setIsVoice(!isVoice)}>
            <img src={`/assets/home/${isVoice ? 'voice' : 'no-voice'}.png`} alt="voice" />
          </div>
          <div className='top-btn-right' onClick={() => handleWallet()}>
            <svg viewBox="0 0 1025 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4168" width="14" height="14"><path d="M662.016 574.208a20.2 20 0 1 0 103.424 0 20.2 20 0 1 0-103.424 0Z" fill="#ffffff" p-id="4169"></path><path d="M947.2 396.8l0-97.792c0-50.176-41.216-91.136-91.648-91.136l-27.136 0 0.512-1.28-586.24-176.128c-40.704-12.288-83.968 10.752-96.256 51.2l-38.4 126.208-16.128 0c-50.432 0-91.648 40.96-91.648 91.136l0 550.4c0 50.176 41.216 91.136 91.648 91.136l763.904 0c50.432 0 91.648-40.96 91.648-91.136l0-97.792c42.752-2.048 76.8-37.376 76.8-80.64l0-194.048C1024 434.176 989.952 398.848 947.2 396.8zM182.016 92.672c6.4-20.736 28.672-32.768 49.664-26.368l471.552 141.568L146.944 207.872 182.016 92.672zM855.552 903.168 91.648 903.168c-29.952 0-54.272-24.064-54.272-53.76l0-550.4c0-29.696 24.32-53.76 54.272-53.76l763.904 0c29.952 0 54.272 24.064 54.272 53.76l0 97.28-271.36 0c-44.544 0-80.896 36.352-80.896 80.896l0 194.048c0 44.544 36.352 80.896 80.896 80.896l271.36 0 0 97.28C909.824 879.104 885.504 903.168 855.552 903.168zM986.624 671.232c0 24.064-19.456 43.52-43.52 43.52L638.208 714.752c-24.064 0-43.52-19.456-43.52-43.52l0-194.048c0-24.064 19.456-43.52 43.52-43.52l304.896 0c24.064 0 43.52 19.456 43.52 43.52L986.624 671.232z" fill="#ffffff" p-id="4170"></path></svg>
            <span>PortKey Wallet</span>
          </div>
        </div>
        {
          isAnimation ? <div className='count-time'>00:0{count}</div> : <>
            <div className='score-section'>
              <div className='avail-score'>
                🏆 <span>Score</span>
              </div>
            </div>
            <div className='score-center'>{oldScore.toLocaleString()}</div>
          </>
        }
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

const NumberRotateWrapper: FC = () => {
  return <div className='speed-wrapper'>
    <ImageRotate />
    <NumberRotate />
    <div className='dot'>.</div>
    <NumberRotate />
    <NumberRotate />
    <NumberRotate />
    <NumberRotate />
    <div className='percent'>%</div>
  </div>
}

const NumberRotate: FC = () => {
  const numArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const [translateY, setTranslateY] = useState(0)
  useEffect(() => {
    let y = 0
    setInterval(() => {
      y -= Math.random() * 5 + 10
      if (y < -450) {
        y = 0
      }
      setTranslateY(y)
    }, 20);
  }, [])
  return <div className='ybpNumber-wrapper'>
    <div className='rotate-wrapper' style={{ transform: `translate(0, ${translateY}px)` }}>
      {
        numArray.map(item => {
          return <div className='rotate-item' key={item}>{item}</div>
        })
      }
    </div>
  </div>
}

const ImageRotate: FC = () => {
  const numArray = ['/assets/home/up.png', '/assets/home/right-arrow.png', '/assets/home/down.png'];
  const [translateY, setTranslateY] = useState(0)
  useEffect(() => {
    let y = 0
    setInterval(() => {
      y -= Math.random() * 5 + 3
      if (y < -100) {
        y = 0
      }
      setTranslateY(y)
    }, 20);
  }, [])
  return <div className='ybpNumber-wrapper'>
    <div className='rotate-wrapper' style={{ transform: `translate(0, ${translateY}px)` }}>
      {
        numArray.map(item => {
          return <div className='rotate-item' key={item}>
            <img src={item} alt='rr' className='rotate-item-img' />
          </div>
        })
      }
    </div>
  </div>
}

export default HomePage
