import './index.scss';
import { FC, useEffect, useRef, useState } from 'react';
import { getBtcPriceReq, getUserInfoReq } from '@/api/common';
import { useDispatch, useSelector } from 'react-redux';
import { setUserInfoAction } from '@/redux/slices/userSlice'
import { Dialog, Popup, Toast } from 'antd-mobile';
import { formatWalletAddress, handleCopyLink, secondsToTimeFormat } from '@/utils/common';
import { useNavigate } from 'react-router-dom';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { beginGameReq, endGameReq } from '@/api/game';
import { initHapticFeedback } from '@telegram-apps/sdk';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { getEntireDIDAelfAddress } from "@portkey/did-ui-react";
import loginConfig from "@/constants/config/login.config";

export const HomePage: FC = () => {
  const { CHAIN_ID } = loginConfig;
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const userInfo = useSelector((state: any) => state.user.info);
  const [isShowRules, setShowRules] = useState(false)
  const scoreTimer = useRef<any>(null)
  const tokenPriceTimer = useRef<any>(null)
  const [isVoice, setIsVoice] = useState(false)
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
  const resultTimer = useRef<any>(null)
  const [isDouDong, setIsDouDong] = useState(false)
  const [symbol, setSymbol] = useState('BTC')
  const [resultInfo, setResultInfo] = useState<any>({})
  const hapticFeedback = initHapticFeedback();
  const { isConnected, walletInfo, walletType, connectWallet, isLocking } = useConnectWallet();
  const handleSwitchSymbol = () => {
    if (isAnimation) {
      return
    }
    if (symbol == 'BTC') {
      setSymbol('ELF')
    } else {
      setSymbol('BTC')
    }
  }
  const handleOpenVoice = () => {
    const _isVoice = !isVoice
    setIsVoice(_isVoice)
    localStorage.setItem('isVoice', _isVoice ? '1' : '')
  }
  useEffect(() => {
    const _isVoice = localStorage.getItem('isVoice')
    if (_isVoice == '1') {
      setIsVoice(true)
    }
  }, [])
  const handleGuess = (type: string) => {
    if (isLocking) {
      Toast.show({
        content: 'Your wallet has been locked',
        position: 'top',
      })
      return
    }
    if (userInfo.ticket <= 0) {
      Toast.show({
        content: 'Gas is Empty, please wait!',
        position: 'top',
      })
      return
    }
    if (isAnimation) {
      return
    }

    beginGameReq({ p: btoa(realPrice.current), type: type })
    if (!isDouDong) {
      const douDongVideo = document.getElementById('douDong') as any
      if (douDongVideo) {
        douDongVideo.play()
        setIsDouDong(true)
      }
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
      clearTimeout(resultTimer.current)
      clearInterval(scoreTimer.current)

      guessTimer.current = setTimeout(async () => {
        setBeginGuess(false)
        const diff = realPrice.current - preRealPrice.current
        let percentPrice: any = diff / preRealPrice.current
        percentPrice = percentPrice.toFixed(4)
        if (percentPrice == '0.0000') {
          percentPrice = '0.0001'
        }
        if (diff == 0) {
          percentPrice = '0.0000'
        }
        setPercent(percentPrice)
        let isRight = false
        if (guessType == 'Rise' && diff > 0) {
          isRight = true
        }
        if (guessType == 'Fall' && diff < 0) {
          isRight = true
        }
        // 如果价格不变，通杀
        if (diff == 0) {
          isRight = false
        }
        if (isRight) {
          hapticFeedback.notificationOccurred('success');
        } else {
          hapticFeedback.notificationOccurred('error');
        }
        const res = await endGameReq({
          gt: btoa(guessType),
          rs: btoa(isRight ? 'Win' : 'Miss'),
          sy: symbol,
          p: btoa(realPrice.current)
        })
        if (res.code == 0) {
          const info = {
            diff: diff,
            prePrice: Number(preRealPrice.current).toFixed(2),
            curPrice: Number(realPrice.current).toFixed(2),
            visible: true,
            percent: percentPrice,
            symbol: symbol,
            isRight: isRight
          }
          if (symbol == 'ELF') {
            info.prePrice = Number(preRealPrice.current).toFixed(4);
            info.curPrice = Number(realPrice.current).toFixed(4);
          }
          setResultInfo(info)

          resultTimer.current = setTimeout(() => {
            dispatch(setUserInfoAction(res.data))
            setIsAnimation(false)
            setGuessType('')
            setResultInfo({
              visible: false,
            })
          }, 2500);
        } else {
          Toast.show({
            content: res.msg,
            position: 'top',
            duration: 5000,
          })
          clearInterval(countTimer.current)
          setIsAnimation(false)
          setGuessType('')
        }
      }, 5500);

      let myCount = 5
      setCount(myCount)
      countTimer.current = setInterval(() => {
        myCount = myCount - 1
        myCount = Math.max(0, myCount)
        setCount(myCount)
      }, 1000);
    }
    return () => {
      clearInterval(countTimer.current)
      clearInterval(resultTimer.current)
      clearTimeout(guessTimer.current)
    }
  }, [isBeginGuess])

  const onConnectBtnClickHandler = async () => {
    try {
      await connectWallet();
    } catch (e: any) {
      const msg = e?.nativeError?.message || e?.message
      Dialog.alert({
        content: `${msg}`,
        confirmText: 'I Know',
        onConfirm: () => {

        },
      })
    }
  };

  const handleWallet = () => {
    if (isConnected) {
      if (walletType == WalletTypeEnum.aa) {
        navigate('/assets')
      } else {
        handleCopyLink(walletInfo.address, 'The address has been copied to the clipboard.')
      }
    } else {
      onConnectBtnClickHandler()
    }
  }

  useEffect(() => {
    getUserInfoReq().then(res => {
      if (res.code == 0) {
        dispatch(setUserInfoAction(res.data))
      }
    })
  }, [])

  useEffect(() => {
    if (isLocking) {
      onConnectBtnClickHandler()
    }
  }, [isLocking])

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
          score += Math.max(Math.round((userScore - oldScore) / 30), 1)
          if (score >= userScore) {
            setOldScore(userScore)
            clearInterval(scoreTimer.current)
          } else {
            setOldScore(score)
          }
        }, 50)
      }
    }
    return () => clearInterval(scoreTimer.current)
  }, [userInfo])

  const getTokenPrice = async () => {
    try {
      const res: any = await getBtcPriceReq(import.meta.env.DEV, `${symbol}USDT`)
      let price = res.price.substring(0, 8)
      realPrice.current = res.price
      if (symbol == 'BTC') {
        price = `${price.substring(0, 2)},${price.substring(2)}`
      }
      setTokenPrice(price)
      return res.price
    } catch (error) {
      console.error(error)
      return error?.current || 0
    }
  }

  useEffect(() => {
    clearInterval(tokenPriceTimer.current)
    getTokenPrice()
    tokenPriceTimer.current = setInterval(() => {
      getTokenPrice()
    }, 2000);
    return () => clearInterval(tokenPriceTimer.current)
  }, [symbol])


  return (
    <div className="home-page fadeIn">
      <div className='race-bg'>
        <video src='/assets/home/doudong.mp4' className='doudong' muted id='douDong' loop />
        <video src='/assets/home/race.mp4' className='doudong' id='race' muted={!isVoice} style={{ opacity: isBeginGuess ? '1' : 0 }} controls={false} />
        <div className={`ybp-container ${isBeginGuess ? 'ybp-container-active' : ''}`}>
          <div className='ybp-inner'>
            <div className='price-title' onClick={() => handleSwitchSymbol()}>
              <div className='price-switch'>{symbol} Price
                <svg viewBox="0 0 1024 1024" className='touch-btn' version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2282" width="20" height="20"><path d="M448 774.4v192l-448-320h1024v128H448z m-448-512h576v-192l448 320H0v-128z" fill="#f5f5f5" p-id="2283"></path></svg>
              </div>
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
              <img src="/assets/home/gas.png" alt="gas" width={16} />
              <div className='progress-wrapper'>
                <div className='progress' style={{ width: `${(userInfo?.ticket || 0) / 0.1}%` }}></div>
              </div>
              <div className='change-number'>{userInfo?.ticket}&nbsp;/&nbsp;<span>10</span></div>
              <div className='more' onClick={() => navigate('/task')}>
                <svg className='touch-btn' viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4512" width="14" height="14"><path d="M461.376 945.216a47.808 47.808 0 0 1 1.344-67.84l380.032-365.312L462.72 146.688a48 48 0 0 1 66.368-69.376l416 400.064a48.256 48.256 0 0 1 0 69.312l-416 399.872a47.744 47.744 0 0 1-67.776-1.344z m-384 0a47.808 47.808 0 0 1 1.344-67.84l380.032-365.312L78.72 146.688a48 48 0 0 1 66.432-69.376l416 400.064a48.256 48.256 0 0 1 0 69.312l-416 399.872a47.808 47.808 0 0 1-67.84-1.344z" fill="#e6e6e6" p-id="4513"></path></svg>
              </div>
            </div>
          </div>
          <RecoveryComp userInfo={userInfo} />
        </div>

      </div>
      <div className='operation-btns'>
        <div className='operation-title'>Guess the {symbol} price in 5 seconds</div>
        <div className='btns'>
          <div className={`btn-outLine ${guessType && guessType == 'Fall' ? 'dark-outLine' : ''}`}>
            <div className={`btn ${guessType ? guessType == 'Rise' ? 'active-btn' : 'dark-btn' : ''}`} onClick={() => handleGuess('Rise')}>
              <span>Rise</span>
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="695" width="18" height="18"><path d="M833.28 206.208v760.32l135.808 8.96v-904.96h-904.96l8.96 135.68z" p-id="696"></path><path d="M64 975.616h108.672l715.008-715.008-99.584-99.584-715.008 715.008z" p-id="697"></path><path d="M64 975.616h108.672l715.008-715.008-99.584-99.584-715.008 715.008z" p-id="698"></path></svg>
            </div>
          </div>
          <div className={`btn-outLine ${guessType && guessType == 'Rise' ? 'dark-outLine' : ''}`}>
            <div className={`f-btn btn ${guessType ? guessType == 'Fall' ? 'f-active-btn' : 'f-dark-btn' : ''}`} onClick={() => handleGuess('Fall')}>
              <span>Fall</span>
              <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="903" width="18" height="18"><path d="M833.28 839.808l-769.28-8.96v144.64h905.088v-904.96l-135.68-9.088z" p-id="904"></path><path d="M64 70.4l9.088 99.584 715.008 715.136 99.584-99.584-715.008-715.008z" p-id="905"></path><path d="M64 70.4l9.088 99.584 715.008 715.136 99.584-99.584-715.008-715.008z" p-id="906"></path></svg>
            </div>
          </div>
        </div>
        <div className='tktj' onClick={() => navigate('/terms')}>Terms and Conditions</div>
      </div>
      <div className='main-content'>
        <div className='top-btn'>
          <div className='top-btn-left touch-btn' onClick={() => handleOpenVoice()}>

            <img src={`/assets/home/${isVoice ? 'voice' : 'no-voice'}.png`} alt="voice" />
          </div>
          <div className='top-btn-right touch-btn' onClick={() => handleWallet()}>
            <img src='/assets/home/wallet.png' width={18} />
            <span>{isConnected ? getEntireDIDAelfAddress(formatWalletAddress(walletInfo?.address || userInfo?.wallet) || '', undefined, CHAIN_ID) : isLocking ? 'Unlock' : 'Portkey Wallet'}</span>
          </div>

        </div>
        {
          isAnimation ? <div className='count-time'>00:0{count}</div> : <>
            <div className='score-section'>
              <div className='avail-score'>
                <img src="/assets/home/jb.png" alt="jb" width={18} />
                <span>Score</span>
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
      <ResultComp {...resultInfo} />
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
  const timer = useRef<any>(null)
  useEffect(() => {
    let y = 0
    timer.current = setInterval(() => {
      y -= Math.random() * 5 + 10
      if (y < -450) {
        y = 0
      }
      setTranslateY(y)
    }, 20);
    return () => {
      clearInterval(timer.current)
    }
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
  const timer = useRef<any>(null)
  useEffect(() => {
    let y = 0
    timer.current = setInterval(() => {
      y -= Math.random() * 5 + 3
      if (y < -100) {
        y = 0
      }
      setTranslateY(y)
    }, 20);
    return () => {
      clearInterval(timer.current)
    }
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

type ResultCompProps = {
  visible: boolean;
  percent: string;
  prePrice: number;
  curPrice: number;
  diff: number;
  symbol: string;
  isRight: boolean,
}

const ResultComp: FC<ResultCompProps> = ({ percent, prePrice, curPrice, diff, visible, symbol, isRight }) => {
  return (
    <>
      {
        visible ? <div className='result-comp'>
          <div className='result-comp-content'>
            <div className='rcct-content'>
              {
                isRight ? <div className='rcct-miss'>
                  <img src='/assets/home/success.png' className='success' />
                  <img src='/assets/home/win.png' className='miss' />
                </div> : <div className='rcct-miss'>
                  <img src='/assets/home/fail.png' className='fail' />
                  <img src='/assets/home/miss.png' className='miss' />
                </div>
              }
            </div>
            <div className='rccb-content'>
              <div className='rcc-desc'>
                <span>{symbol}&nbsp;Price</span>
                <span className={`${diff > 0 ? 'rcc-win' : diff < 0 ? 'rcc-miss' : ''}`}>
                  {percent}%
                </span>
              </div>
              <div className='rcc-detail'>
                <span>From</span>&nbsp;${prePrice}<span>To</span>&nbsp;${curPrice}
              </div>
            </div>
          </div>
        </div> : null
      }
    </>
  )
}

const RecoveryComp: FC<any> = ({ userInfo }) => {
  const systemConfig = useSelector((state: any) => state.user.system);
  const [isShow, setIsShow] = useState(false)
  const [count, setCount] = useState('00:00')
  const dispatch = useDispatch()
  const timer = useRef<any>(null)
  useEffect(() => {
    clearInterval(timer.current)
    if (userInfo.ticket < 10) {
      setIsShow(true)
      let diffTime = Math.floor((new Date().getTime() - new Date(userInfo.last_play_time).getTime()) / 1000)
      diffTime = systemConfig.recovery_time - diffTime % systemConfig.recovery_time
      setCount(secondsToTimeFormat(diffTime))
      timer.current = setInterval(() => {
        if (diffTime == 0) {
          clearInterval(timer.current)
          getUserInfoReq().then(res => {
            if (res.code == 0) {
              dispatch(setUserInfoAction(res.data))
            }
          })
        } else {
          diffTime -= 1;
          setCount(secondsToTimeFormat(diffTime))
        }


      }, 1000);
    } else {
      setIsShow(false)
    }
    return () => {
      clearInterval(timer.current)
    }
  }, [userInfo])
  return <>
    {
      isShow ? <div className='recovery-comp'>
        <div className='recovery'>Gas Recovery Time:</div>
        <div className='count'>{count}</div>
      </div> : null
    }
  </>
}

export default HomePage
