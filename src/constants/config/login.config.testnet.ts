import { TChainId } from "@aelf-web-login/wallet-adapter-base";

export const CHAIN_ID = "AELF" satisfies TChainId;
export const TELEGRAM_BOT_ID = import.meta.env.VITE_TELEGRAM_BOT_ID;

export const NETWORK_TYPE = import.meta.env.VITE_NETWORK_TYPE;
export const RPC_SERVER_AELF = "https://aelf-test-node.aelf.io";
export const RPC_SERVER_TDVV = "https://tdvv-public-node.aelf.io";
export const RPC_SERVER_TDVW = "https://tdvw-test-node.aelf.io";
export const GRAPHQL_SERVER =
  "https://dapp-aa-portkey-test.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema/graphql";

export const CONNECT_SERVER = "https://auth-aa-portkey-test.portkey.finance";

export const PORTKEY_SERVER_URL = "https://aa-portkey-test.portkey.finance";
