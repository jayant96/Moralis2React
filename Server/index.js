const express = require("express");
const Moralis = require("moralis").default;
const cors = require("cors");
const { EvmChain } = require("@moralisweb3/common-evm-utils");
require('dotenv').config();
// for our server's method of setting a user session
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 4000;

// to use our .env variables
app.use(express.json());
app.use(cookieParser());

// allow access to React app domain
app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

const address = "0xCd9680dd8318b0df924f0bD47a407c05B300e36f";
const chain = EvmChain.ETHEREUM;
const config = {
  domain: process.env.APP_DOMAIN,
  statement: 'Please sign this message to confirm your identity.',
  uri: process.env.REACT_URL,
  timeout: 60,
};

app.post('/request-message', async (req, res) => {
  const { address, chain, network } = req.body;

  try {
    const message = await Moralis.Auth.requestMessage({
      address,
      chain,
      network,
      ...config,
    });

    res.status(200).json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
});

app.post('/verify', async (req, res) => {
  try {
    const { message, signature } = req.body;

    const { address, profileId } = (
      await Moralis.Auth.verify({
        message,
        signature,
        networkType: 'evm',
      })
    ).raw;

    const user = { address, profileId, signature };

    // create JWT token
    const token = jwt.sign(user, process.env.AUTH_SECRET);

    // set JWT cookie
    res.cookie('jwt', token, {
      httpOnly: true,
    });

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
    console.error(error);
  }
});

app.get('/authenticate', async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return res.sendStatus(403); // if the user did not send a jwt token, they are unauthorized

  try {
    const data = jwt.verify(token, process.env.AUTH_SECRET);
    res.json(data);
  } catch {
    return res.sendStatus(403);
  }
});

app.get('/logout', async (req, res) => {
  try {
    res.clearCookie('jwt');
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(403);
  }
});

async function getDemoData() {
    // Get native balance
    const nativeBalance = await Moralis.EvmApi.balance.getNativeBalance({
      address,
      chain,
    });

      // Get token balances
    const tokenBalances = await Moralis.EvmApi.token.getWalletTokenBalances({
    address,
    chain,
  });

     // Get the nfts
  const nftsBalances = await Moralis.EvmApi.nft.getWalletNFTs({
    address,
    chain,
    limit: 10,
  });

  
    // Format the native balance formatted in ether via the .ether getter
    const native = nativeBalance.result.balance.ether;

    // Format the balances to a readable output with the .display() method
    const tokens = tokenBalances.result.map((token) => token.display());

    // Format the output to return name, amount and metadata
  const nfts = nftsBalances.result.map((nft) => ({
    name: nft.result.name,
    amount: nft.result.amount,
   // metadata: nft.result.metadata,
  }));
  
    return { native, tokens, nfts };
  }

  app.get("/balances", async (req, res) => {
    try {
      // Get and return the crypto data
      const data = await getDemoData();
      res.status(200).json({
        address,
        native: data.native,
        nft: data.nfts
      });
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500);
      res.json({ error: error.message });
    }
  });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const startServer = async () => {
    await Moralis.start({
        apiKey: process.env.MORALIS_API_KEY,            
    });


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


};

startServer();