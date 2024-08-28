import { initUtils } from '@telegram-apps/sdk'
import './index.scss'

const TermsPage = () => {
  const utils = initUtils()
  const handleOpenLink = () => {
    const link = 'https://telegram.org/tos/mini-apps'
    if (localStorage.getItem('h5PcRoot') == '1') {
      window.open(link)
    } else {
      utils.openLink(link)
    }
  }
  return <div className='terms-page'>
    <div className='title'>PortKey Racer Service Terms</div>
    <div className='time'>Published on September 1st, 2024</div>
    <div className='terms-content'>
      PortKey Racer reserves the right to cancel or suspend any player account participation in the event, and to forfeit any rewards received for engaging in dishonest or abusive behavior. These behaviors include but are not limited to malicious clicks to gain points, bulk account building, impersonating others' accounts, using others' identity information to register accounts, providing false identity information, using devices to gain points or other malicious tools, conducting money laundering transactions or false transactions, violating any applicable rules or policies or any activity/project rules or terms or announcements of Ouyi (as amended and updated from time to time), violating local regulations or engaging in any activities aimed at abusing, interfering or disrupting the legitimate operation of the project.
    </div>
    <div className='terms-bot'>
      By participating in this game, you agree to <span onClick={() => handleOpenLink()}>the terms of service of the Telegram mini program</span>. We will collect and use your data (such as your Telegram username, Telegram ID, and points) for reward and verification purposes. All potential rewards must comply with separate terms, conditions, and eligibility requirements.
    </div>
  </div>
}

export default TermsPage;