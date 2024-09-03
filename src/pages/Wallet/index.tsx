import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import './index.scss'
import { Button } from 'antd-mobile';
import { useSelector } from 'react-redux';
import { formatWalletAddress, handleCopyLink } from '@/utils/common';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import moment from 'moment';

function WalletPage() {
  const router = useNavigate()
  const [isH5PcRoot, setH5PcRoot] = useState(false)
  const { connectWallet, isConnected, disConnectWallet, walletInfo, isLocking, lock } = useConnectWallet();
  const userInfo = useSelector((state: any) => state.user.info);
  const onConnectBtnClickHandler = async () => {
    try {
      await connectWallet();
    } catch (e: any) {
      console.error(e.message);
    }
  };
  const handleLock = () => {
    if (!isLocking) {
      lock()
    }
  }
  const handleAsset = async () => {
    if (isH5PcRoot) {
      await disConnectWallet()
    } else {
      router('/assets')
    }
  }

  useEffect(() => {
    if (localStorage.getItem('h5PcRoot') == '1') {
      setH5PcRoot(true)
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
    <div className='wallet-page-title'>完成身份认证，即可获得<span>赛事驾照</span></div>
    <div className='sub-title'>获得赛车驾照后，您奖符合神秘惊喜领取资格</div>
    <div className='ready-confirm'>
      <img src='/assets/wallet/people.png' />
      <span className='count'>444</span>
      <span className='desc'>名车手已完成认证</span>
    </div>
    <div className='connect-wrapper'>
      <div className='title'>
        <img src="/assets/frens/type.png" alt="type" />
        <span>{userInfo?.wallet ? '已认证' : '未认证'}</span>
      </div>
      <div className='connect-content'>
        <div className='username'>
          <span>{userInfo?.username}</span>
          <span className='time'>{moment(userInfo?.createdAt).format('YYYY-MM-DD')}&nbsp;加入</span>
        </div>
        <div className='lv-container'>
          <div className='lv-left'>
            <div className='lv'>当前车手等级</div>
            <div className='lv-name'>
              新手
              <img src='/assets/wallet/go.png' width={6} />
            </div>
            <div className='lv-score'>
              累计积分&nbsp;<span>{userInfo?.score?.toLocaleString()}</span>
            </div>
          </div>
          <div className='lv-right'>
            <img src="/assets/wallet/lv.png" alt="lv" />
            <div className='lv-num'>1</div>
          </div>
        </div>
        {
          isConnected ?
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