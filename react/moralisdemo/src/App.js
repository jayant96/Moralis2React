
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createClient, configureChains, WagmiConfig} from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { mainnet } from 'wagmi/chains';

import Balances from './balances';
import Signin from './signin';
import User from './user';

const { provider, webSocketProvider } = configureChains([mainnet], [ publicProvider(),]);

const client = createClient({
    provider,
    webSocketProvider,
    autoConnect: true,
});

const router = createBrowserRouter([
  {
    path: '/balances',
    element: <Balances />
  },
  {
    path: '/signin',
    element: <Signin />
  },
  {
    path: '/user',
    element: <User />
  }
]);

function App() {
  return (
    <WagmiConfig client={client}>
      <RouterProvider router={router} />
    </WagmiConfig>
  );
}

export default App;
