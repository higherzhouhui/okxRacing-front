import { Suspense, useEffect, useState, type FC } from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Provider } from 'react-redux';
import store from '@/redux/store';
import enUS from 'antd-mobile/es/locales/en-US'
import { ConfigProvider } from 'antd-mobile';
import { SDKProvider } from '@telegram-apps/sdk-react';
import { PortkeyDiscoverWallet } from "@aelf-web-login/wallet-adapter-portkey-discover";
import { PortkeyAAWallet } from "@aelf-web-login/wallet-adapter-portkey-aa";
import { WebLoginProvider, init } from "@aelf-web-login/wallet-adapter-react";
import { IConfigProps } from "@aelf-web-login/wallet-adapter-bridge";
import { SignInDesignEnum } from "@aelf-web-login/wallet-adapter-base";
import loginConfig from "@/constants/config/login.config";
import { APP_NAME } from "@/constants/website";
import BridgeUpdater from '@/components/BridgeUpdater';
import { HashRouter } from 'react-router-dom';
import Loading from '@/components/Loading';
import { App } from './App';

const {
  CHAIN_ID,
  CONNECT_SERVER,
  GRAPHQL_SERVER,
  NETWORK_TYPE,
  PORTKEY_SERVER_URL,
  TELEGRAM_BOT_ID
} = loginConfig;

const didConfig = {
  graphQLUrl: GRAPHQL_SERVER,
  connectUrl: CONNECT_SERVER,
  serviceUrl: PORTKEY_SERVER_URL,
  requestDefaults: {
    baseURL: PORTKEY_SERVER_URL,
    timeout: 30000,
  },

  socialLogin: {
    Telegram: {
      botId: TELEGRAM_BOT_ID,
    }
  },
  referralInfo: {
    referralCode: "",
    projectCode: "15017",
  },
};

const baseConfig: IConfigProps["baseConfig"] = {
  showVconsole: false,
  networkType: NETWORK_TYPE,
  chainId: CHAIN_ID,
  keyboard: true,
  noCommonBaseModal: false,
  design: SignInDesignEnum.CryptoDesign, // "SocialDesign" | "CryptoDesign" | "Web2Design"
  titleForSocialDesign: "Crypto Wallet",
  iconSrcForSocialDesign:
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHZpZXdCb3g9IjAgMCA1NiA1NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgaWQ9IkVsZiBFeHBsb3JlciI+CjxyZWN0IHdpZHRoPSI1NiIgaGVpZ2h0PSI1NiIgZmlsbD0id2hpdGUiLz4KPHBhdGggaWQ9IlNoYXBlIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMwLjAwMDMgMTEuODQyQzMzLjEwNjkgMTEuODQyIDM1LjYyNTIgOS4zMjM3MSAzNS42MjUyIDYuMjE3MTlDMzUuNjI1MiAzLjExMDY4IDMzLjEwNjkgMC41OTIzNDYgMzAuMDAwMyAwLjU5MjM0NkMyNi44OTM4IDAuNTkyMzQ2IDI0LjM3NTUgMy4xMTA2OCAyNC4zNzU1IDYuMjE3MTlDMjQuMzc1NSA5LjMyMzcxIDI2Ljg5MzggMTEuODQyIDMwLjAwMDMgMTEuODQyWk01NS40MDkzIDI4LjAzNzhDNTUuNDA5MyAzNC4zNTc5IDUwLjI4NTggMzkuNDgxNCA0My45NjU3IDM5LjQ4MTRDMzcuNjQ1NSAzOS40ODE0IDMyLjUyMiAzNC4zNTc5IDMyLjUyMiAyOC4wMzc4QzMyLjUyMiAyMS43MTc2IDM3LjY0NTUgMTYuNTk0MSA0My45NjU3IDE2LjU5NDFDNTAuMjg1OCAxNi41OTQxIDU1LjQwOTMgMjEuNzE3NiA1NS40MDkzIDI4LjAzNzhaTTM1LjYyNTIgNDkuODU4MkMzNS42MjUyIDUyLjk2NDggMzMuMTA2OSA1NS40ODMxIDMwLjAwMDMgNTUuNDgzMUMyNi44OTM4IDU1LjQ4MzEgMjQuMzc1NSA1Mi45NjQ4IDI0LjM3NTUgNDkuODU4MkMyNC4zNzU1IDQ2Ljc1MTcgMjYuODkzOCA0NC4yMzM0IDMwLjAwMDMgNDQuMjMzNEMzMy4xMDY5IDQ0LjIzMzQgMzUuNjI1MiA0Ni43NTE3IDM1LjYyNTIgNDkuODU4MlpNMS4xOTczMyAxMi4yM0MtMC40NTEzMzEgMTYuNTk0MSAxLjg3NjE5IDIxLjU0MDEgNi4yNDAzIDIzLjE4ODdDOS4xNDk3IDI0LjI1NTUgMTIuMjUzMSAyMy42NzM2IDE0LjQ4MzYgMjEuODMxQzE2LjUyMDIgMjAuMzc2MyAxOS4xMzg3IDE5Ljg5MTQgMjEuNjYwMSAyMC44NjEyQzIzLjMwODggMjEuNDQzMSAyNC41Njk1IDIyLjUwOTkgMjUuNDQyNCAyMy44Njc2TDI1LjUzOTMgMjQuMDYxNUMyNS45MjczIDI0LjY0MzQgMjYuNTA5MSAyNS4yMjUzIDI3LjI4NSAyNS40MTkzQzI5LjAzMDYgMjYuMDk4MSAzMS4wNjcyIDI1LjEyODMgMzEuNjQ5MSAyMy4zODI3QzMyLjMyOCAyMS42MzcgMzEuMzU4MiAxOS42MDA1IDI5LjYxMjUgMTkuMDE4NkMyOC44MzY3IDE4LjcyNzYgMjguMDYwOCAxOC43Mjc2IDI3LjI4NSAxOS4wMTg2QzI1LjczMzMgMTkuNTAzNSAyMy45ODc3IDE5LjUwMzUgMjIuMzM5IDE4LjkyMTZDMTkuOTE0NSAxOC4wNDg4IDE4LjI2NTggMTYuMTA5MiAxNy41ODcgMTMuODc4NkwxNy40OSAxMy42ODQ3QzE3LjQ5IDEzLjU4NzcgMTcuNDkgMTMuNDkwNyAxNy4zOTMgMTMuNDkwN1YxMy4yOTY4QzE2LjcxNDIgMTAuNTgxMyAxNC44NzE1IDguMjUzNzggMTIuMDU5MSA3LjI4Mzk4QzcuNjk1IDUuNTM4MzQgMi43NDkwMSA3Ljc2ODg4IDEuMTk3MzMgMTIuMjNaTTYuMjQwMyAzMi44ODY4QzEuODc2MTkgMzQuNTM1NCAtMC40NTEzMzEgMzkuNDgxNCAxLjE5NzMzIDQzLjg0NTVDMi44NDU5OSA0OC4zMDY2IDcuNjk1IDUwLjUzNzIgMTIuMDU5MSA0OC43OTE1QzE0Ljg3MTUgNDcuODIxNyAxNi43MTQyIDQ1LjQ5NDIgMTcuMzkzIDQyLjc3ODdWNDIuNTg0OEMxNy40OSA0Mi41ODQ4IDE3LjQ5IDQyLjQ4NzggMTcuNDkgNDIuMzkwOEwxNy41ODcgNDIuMTk2OUMxOC4yNjU4IDM5Ljk2NjMgMTkuOTE0NSAzOC4wMjY3IDIyLjMzOSAzNy4xNTM5QzIzLjk4NzcgMzYuNTcyIDI1LjczMzMgMzYuNTcyIDI3LjI4NSAzNy4wNTY5QzI4LjA2MDggMzcuMzQ3OSAyOC44MzY3IDM3LjM0NzkgMjkuNjEyNSAzNy4wNTY5QzMxLjM1ODIgMzYuNDc1IDMyLjMyOCAzNC40Mzg1IDMxLjY0OTEgMzIuNjkyOEMzMS4wNjcyIDMwLjk0NzIgMjkuMDMwNiAyOS45Nzc0IDI3LjI4NSAzMC42NTYyQzI2LjUwOTEgMzAuODUwMiAyNS45MjczIDMxLjQzMjEgMjUuNTM5MyAzMi4wMTRMMjUuNDQyNCAzMi4yMDc5QzI0LjU2OTUgMzMuNTY1NiAyMy4zMDg4IDM0LjYzMjQgMjEuNjYwMSAzNS4yMTQzQzE5LjEzODcgMzYuMTg0MSAxNi41MjAyIDM1LjY5OTIgMTQuNDgzNiAzNC4yNDQ1QzEyLjI1MzEgMzIuNDAxOSA5LjE0OTcgMzEuODIgNi4yNDAzIDMyLjg4NjhaIiBmaWxsPSIjMjY2Q0QzIi8+CjwvZz4KPC9zdmc+Cg==",
};

const wallets = [
  new PortkeyAAWallet({
    appName: APP_NAME,
    chainId: CHAIN_ID,
    autoShowUnlock: true,
    // noNeedForConfirm: false,
  }),
  new PortkeyDiscoverWallet({
    networkType: NETWORK_TYPE,
    chainId: CHAIN_ID,
    autoRequestAccount: true,
    autoLogoutOnDisconnected: true,
    autoLogoutOnNetworkMismatch: true,
    autoLogoutOnAccountMismatch: true,
    autoLogoutOnChainMismatch: true,
  }),
  // new NightElfWallet({
  //   chainId: CHAIN_ID,
  //   appName: APP_NAME,
  //   connectEagerly: true,
  //   useMultiChain: false,
  //   defaultRpcUrl: RPC_SERVER_AELF,
  //   nodes: {
  //     AELF: {
  //       chainId: "AELF",
  //       rpcUrl: RPC_SERVER_AELF,
  //     },
  //     tDVW: {
  //       chainId: "tDVW",
  //       rpcUrl: RPC_SERVER_TDVW,
  //     },
  //     tDVV: {
  //       chainId: "tDVV",
  //       rpcUrl: RPC_SERVER_TDVV,
  //     },
  //   },
  // }),
];

const config: IConfigProps = {
  didConfig,
  baseConfig,
  wallets,
};

const ErrorBoundaryError: FC<{ error: unknown }> = ({ error }) => (
  import.meta.env.DEV ?<div style={{ color: '#fff' }}>
    <p>An unhandled error occurred:</p>
    <blockquote>
      <code>
        {error instanceof Error
          ? error.message
          : typeof error === 'string'
            ? error
            : JSON.stringify(error)}
      </code>
    </blockquote>
  </div> : <ErrorBoundaryProd /> 
);

function ErrorBoundaryProd() {
  useEffect(() => {
    setTimeout(() => {
      localStorage.clear()
      window.location.reload()
    }, 5000);
  }, [])
  return <div className='error-page'>
    <Loading />
  </div>
}

function WebLoginProviderELE({ children }: { children: React.ReactNode }) {
  const bridgeAPI = init(config);

  return <WebLoginProvider bridgeAPI={bridgeAPI}>{children}</WebLoginProvider>;
}

export default function WebLoginConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const scpt = document.createElement("script");
    scpt.src = "./telegram-web-app.js";
    document.body.appendChild(scpt);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    scpt?.addEventListener("load", (e: any) => {
      setIsLoaded(true);
      return;
    });
  }, []);
  return isLoaded ? (
    <WebLoginProviderELE>{children}</WebLoginProviderELE>
  ) : null;
}


const MiNiRoot: FC = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Provider store={store}>
        <ConfigProvider locale={enUS}>
          <SDKProvider acceptCustomStyles>
            <WebLoginConfigProvider>
              <HashRouter>
                <App />
                <BridgeUpdater />
              </HashRouter>
            </WebLoginConfigProvider>
          </SDKProvider>
        </ConfigProvider>
      </Provider>
    </Suspense>
  );
};

export const Root: FC = () => (
  <ErrorBoundary fallback={ErrorBoundaryError} >
    <MiNiRoot />
  </ErrorBoundary>
);
