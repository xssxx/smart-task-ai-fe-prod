import { useState, useEffect } from "react";
import { getTokenFromCookie } from "@/services";

interface AccountInfo {
  accountId: string | null;
  nodeId: string | null;
}

export const useAccountInfo = (): AccountInfo => {
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    accountId: null,
    nodeId: null,
  });

  useEffect(() => {
    const token = getTokenFromCookie();
    if (token) {
      try {
        // Decode JWT (simple base64 decode, not verification)
        const payload = JSON.parse(atob(token.split(".")[1]));
        setAccountInfo({
          accountId: payload.AccountId || null,
          nodeId: payload.NodeId || null,
        });
      } catch (error) {
        console.error("Failed to decode JWT:", error);
      }
    }
  }, []);

  return accountInfo;
};
