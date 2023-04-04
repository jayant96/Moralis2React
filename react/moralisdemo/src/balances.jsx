import { useEffect, useState } from 'react';

import axios from 'axios';

export default function Balances() {
  const [balances, setBalances] = useState({});

  useEffect(() => {
    axios(`http://localhost:4000/balances`).then(({ data }) => {
      setBalances(data);
     
    });
  }, []);

  useEffect(() => {
    console.log("Balances", balances.native);
    console.log('Server URL:', process.env.REACT_APP_SERVER_URL);

  });

  return (
    <div>
       <h3>Wallet: {balances.address}</h3>
       <h3>Native Balance: {balances.native} ETH</h3>
      <h3>NFT Balances:</h3>
      <ul>
        {balances.nft && balances.nft.map((nft, index) => ( 
            <li key={index}>
                {nft.name}: {nft.amount}
            </li>
        ))}
      </ul>
    </div>
  );
}