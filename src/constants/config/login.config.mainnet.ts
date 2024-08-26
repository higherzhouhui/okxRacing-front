import { NetworkEnum, TChainId } from "@aelf-web-login/wallet-adapter-base";

export const CHAIN_ID = "tDVW" satisfies TChainId;
export const TELEGRAM_BOT_ID = import.meta.env.VITE_TELEGRAM_BOT_ID;

export const NETWORK_TYPE = NetworkEnum.TESTNET;
export const RPC_SERVER_AELF = "https://explorer-test.aelf.io/chain";
export const RPC_SERVER_TDVV = "https://explorer-test-side02.aelf.io/chain";
export const RPC_SERVER_TDVW = "https://explorer-test-side02.aelf.io/chain";
export const GRAPHQL_SERVER =
  "https://dapp-aa-portkey-test.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql";

export const CONNECT_SERVER = "https://auth-aa-portkey-test.portkey.finance";

export const PORTKEY_SERVER_URL = "https://aa-portkey-test.portkey.finance";
