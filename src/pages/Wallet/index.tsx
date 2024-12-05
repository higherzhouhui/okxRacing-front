import './index.scss'
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useSelector } from 'react-redux';
import { formatWalletAddress, handleCopyLink } from '@/utils/common';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import { getCertifiedsReq } from '@/api/common';
import { Dialog } from 'antd-mobile';
import { getEntireDIDAelfAddress } from "@portkey/did-ui-react";
import loginConfig from "@/constants/config/login.config";

function WalletPage() {
  const { CHAIN_ID } = loginConfig;  
  const navigate = useNavigate()
  const [isH5PcRoot, setH5PcRoot] = useState(false)
  const { connectWallet, isConnected, disConnectWallet, walletInfo, isLocking, lock, walletType } = useConnectWallet();
  const userInfo = useSelector((state: any) => state.user.info);
  const systemConfig = useSelector((state: any) => state.user.system);
  const [total, setTotal] = useState(0)
  const [hasToken, setHasToken] = useState(true)
  const timer = useRef<any>(null)
  const timer1 = useRef<any>(null)
  const [levelInfo, setLevelInfo] = useState<any>({})
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

  const handleAsset = async () => {
    navigate('/assets')
  }

  useEffect(() => {
    if (localStorage.getItem('h5PcRoot') == '1') {
      setH5PcRoot(true)
      getCertifiedsReq().then(res => {
        if (res.code == 0) {
          setTotal(res.data.count)
        }
      })
    } else {
      getCertifiedsReq().then(res => {
        if (res.code == 0) {
          setTotal(res.data.count)
        }
      })
    }
  }, [])

  useEffect(() => {
    clearTimeout(timer.current)
    clearTimeout(timer1.current)
    if (!localStorage.getItem('authorization')) {
      setHasToken(false)
    } else {
      setHasToken(true)
    }
    if (localStorage.getItem('h5PcRoot') == '1') {
      timer.current = setTimeout(() => {
        if (!isConnected && !walletInfo && !isLocking) {
          timer1.current = setTimeout(() => {
            if (isH5PcRoot) {
              localStorage.removeItem('authorization')
              localStorage.removeItem('walletInfo')
            }
            onConnectBtnClickHandler()
          }, 500);
        }
      }, 500);
      return () => {
        clearTimeout(timer.current)
        clearTimeout(timer1.current)
      }
    }
  }, [isConnected, walletInfo, isLocking])


  useEffect(() => {
    if (userInfo && systemConfig && systemConfig?.level) {
      const levelList = systemConfig.level
      for (let i = 0; i < levelList.length; i ++) {
        if (userInfo.score < levelList[i].score) {
          setLevelInfo(levelList[i])
          break
        }
      }
    }
  }, [userInfo, systemConfig])

  return <div className='wallet-page fadeIn'>
    <div className='wallet-page-title'>Upon completion of identity verification, you will be able to obtain<span>the race driver's license.</span></div>
    <div className='sub-title'>After obtaining the race driver's license, you will be eligible for the mystery reward.</div>
    <div className='ready-confirm'>
      <img src='/assets/wallet/people.png' />
      <span className='count'>{total}</span>
      <span className='desc'>renowned drivers have completed the certification.</span>
    </div>
    <div className='connect-wrapper'>
      <div className='title'>
        <img src="/assets/frens/type.png" alt="type" />
        <span>{userInfo?.wallet ? 'Certified' : 'Not certified'}</span>
      </div>
      <div className='connect-content'>
        {
          userInfo?.username ? <>
            <div className='full-name'>{`${userInfo?.firstName || ''} ${userInfo?.lastName || ''} ${!userInfo?.firstName && !userInfo.lastName ? userInfo?.username : ''}`}</div>
            <div className='username'>
              <span>{userInfo?.username}</span>
              <span className='time'>{moment(userInfo?.createdAt).format('YYYY-MM-DD')}&nbsp;Join</span>
            </div>
          </> : <div></div>
        }
        <div className='lv-container'>
          <div className='lv-left'>
            <div className='lv'>Current License Level</div>
            <div className='lv-name touch-btn' onClick={() => navigate('/level')}>
              {levelInfo?.name || 'Novice'}
              <img src='/assets/wallet/go.png' width={6} />
            </div>
            <div className='lv-score'>
              Accumulated points&nbsp;<span>{userInfo?.score?.toLocaleString() || 0}</span>
            </div>
          </div>
          <div className='lv-right'>
            <img src="/assets/wallet/lv.png" alt="lv" />
            <div className='lv-num'>{levelInfo?.level || 1}</div>
          </div>
        </div>
        {
          isConnected && userInfo?.wallet && hasToken ?
            <div>
              <div className='connect-assets'>
                <div className='my-assets'>
                  <div className='label'>
                    <div style={{marginBottom: '2px'}}>Your Wallet Address:</div>
                    {getEntireDIDAelfAddress(formatWalletAddress(userInfo?.wallet) || '', undefined, CHAIN_ID)}
                    </div>
                  <div className='value touch-btn' onClick={() => handleCopyLink(userInfo.wallet, 'The address has been copied to the clipboard.')}>Copy</div>
                </div>

                {
                  walletType == "PortkeyAA" ? <div className='my-assets' onClick={() => handleAsset()}>
                    <div className='label'>Your Assets</div>
                    <div className='value touch-btn'>Assets</div>
                  </div> : <div></div>
                }
                {
                  isH5PcRoot ? <>
                    {
                      walletType == 'PortkeyAA' ? <>
                        <div className='my-assets'>
                          <div className='label'>Lock Wallet</div>
                          <div className='value touch-btn' onClick={lock}>{isLocking ? 'unLock' : 'Lock'}</div>
                        </div>
                        <div className='my-assets'>
                          <div className='label'>Disconnect/Switch Wallet</div>
                          <div className='value touch-btn' onClick={async () => await disConnectWallet()}>Disconnect</div>
                        </div>
                      </> : <div className='my-assets'>
                        <div className='label'>Disconnect/Switch Wallet</div>
                        <div className='value touch-btn' onClick={async () => await disConnectWallet()}>Disconnect</div>
                      </div>
                    }
                  </> : <div></div>
                }

              </div>
            </div>
            :
            <div onClick={onConnectBtnClickHandler} className='connect-btn'>
              {
                isLocking ? 'UnLock' : 'Connect'
              }
            </div>
        }
      </div>
    </div>
  </div>
}

export default WalletPage