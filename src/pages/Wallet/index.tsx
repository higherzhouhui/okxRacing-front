import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import './index.scss'
import { useSelector } from 'react-redux';
import { formatWalletAddress, handleCopyLink } from '@/utils/common';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import moment from 'moment';
import { getCertifiedsReq } from '@/api/common';

function WalletPage() {
  const navigate = useNavigate()
  const [isH5PcRoot, setH5PcRoot] = useState(false)
  const { connectWallet, isConnected, disConnectWallet, walletInfo, isLocking, lock } = useConnectWallet();
  const userInfo = useSelector((state: any) => state.user.info);
  const [total, setTotal] = useState(0)
  const onConnectBtnClickHandler = async () => {
    try {
      await connectWallet();
    } catch (e: any) {
      console.error(e.message);
    }
  };

  const handleAsset = async () => {
    if (isH5PcRoot) {
      await disConnectWallet()
    } else {
      navigate('/assets')
    }
  }

  useEffect(() => {
    if (localStorage.getItem('h5PcRoot') == '1') {
      setH5PcRoot(true)
      if (localStorage.getItem('token')) {
        getCertifiedsReq().then(res => {
          if (res.code == 0) {
            setTotal(res.data.count)
          }
        })
      }
    } else {
      getCertifiedsReq().then(res => {
        if (res.code == 0) {
          setTotal(res.data.count)
        }
      })
    }
  }, [])

  // useEffect(() => {
  //   setTimeout(() => {
  //     if (!isConnected && !walletInfo) {
  //       setTimeout(() => {
  //         connectWallet()
  //       }, 500);
  //     }
  //   }, 1000);
  // }, [isConnected, walletInfo])

  return <div className='wallet-page fadeIn'>
    <div className='wallet-page-title'>Upon completion of identity verification, you will be able to obtain<span>the race driver's license.</span></div>
    <div className='sub-title'>After obtaining the race driver's license, you will be eligible for the mysterious surprise reward.</div>
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
        <div className='full-name'>{`${userInfo?.firstName} ${userInfo?.lastName}`}</div>
        <div className='username'>
          <span>{userInfo?.username}</span>
          <span className='time'>{moment(userInfo?.createdAt).format('YYYY-MM-DD')}&nbsp;Join</span>
        </div>
        <div className='lv-container'>
          <div className='lv-left'>
            <div className='lv'>Current driver level</div>
            <div className='lv-name' onClick={() => navigate('/level')}>
              Novice
              <img src='/assets/wallet/go.png' width={6} />
            </div>
            <div className='lv-score'>
              Accumulated points&nbsp;<span>{userInfo?.score?.toLocaleString()}</span>
            </div>
          </div>
          <div className='lv-right'>
            <img src="/assets/wallet/lv.png" alt="lv" />
            <div className='lv-num'>1</div>
          </div>
        </div>
        {
          isConnected && userInfo?.wallet ?
            <div className='connect-assets'>
              <div className='my-assets' onClick={() => handleCopyLink(userInfo.wallet)}>
                {formatWalletAddress(userInfo.wallet)}
              </div>
              {
                isH5PcRoot ? <div className='my-assets' onClick={lock}>
                  {isLocking ? 'unLock' : 'Lock'}
                </div> : null
              }
              <div className='my-assets' onClick={() => handleAsset()}>
                {
                  isH5PcRoot ? 'Disconnect' : 'Assets'
                }
              </div>
            </div>
            :
            <div onClick={onConnectBtnClickHandler} className='connect-btn'>Connect</div>
        }
      </div>
    </div>
  </div>
}

export default WalletPage