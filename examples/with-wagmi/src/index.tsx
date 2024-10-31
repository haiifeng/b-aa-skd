import { AccountCard } from '@/components/account-card';
import { NFTCard } from '@/components/nft-card';
import { WalletConnector } from '@/components/wallet-connector';

export default function IndexPage() {
  return (
    <main className="container">
      <h1 className="my-4 mb-16 text-3xl font-bold">Bitlayer AA Demo</h1>
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
        <div className="grow order-last lg:order-first flex flex-col gap-4">
          <NFTCard />
        </div>
        <aside className="flex flex-col gap-4 items-center w-full lg:w-[32rem] min-w-0 shrink-0">
          <WalletConnector />
          <AccountCard />
        </aside>
      </div>
    </main>
  );
}
