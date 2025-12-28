'use client';
import {useQuery} from '@tanstack/react-query';
import {usePublicClient} from 'wagmi';
import {useAccount} from '@/hooks/wagmi-viem-proxy/use-account';
import {createInstance, initSDK, SepoliaConfig,} from '@luxfhe-fhe/relayer-sdk/web';
import {clientToEthersTransport} from '@/lib/wagmi-etheres-adapter';

const sepoliaChainId = 11155111; // Sepolia testnet chain ID

export function useFhevm() {
  const { address, chainId } = useAccount();

  const client = usePublicClient({
    chainId: sepoliaChainId,
  });

  return useQuery({
    queryKey: ['fhevm', address, chainId],
    queryFn: async () => {
      if (!address || !chainId || !client) {
        throw new Error('Address or chainId is not available');
      }
      if (chainId !== sepoliaChainId) {
        throw new Error('FHEVM is only available on Sepolia testnet');
      }
      await initSDK();

      const network = clientToEthersTransport(client);

      return await createInstance({
        ...SepoliaConfig,
        network,
      });
    },
    enabled: !!address && !!chainId && !!client,
    // do not refresh automatically
    staleTime: Infinity,
  });
}
