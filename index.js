const express = require("express");
const Moralis = require("moralis").default;
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = 3003;

app.use(cors());
app.use(express.json());

app.get("/getTokens", async (req, res) => {

  const { userAddress, chain } = req.query;

  const tokens = await Moralis.EvmApi.token.getWalletTokenBalances({
    chain: chain,
    address: userAddress,
  });

  const nfts = await Moralis.EvmApi.nft.getWalletNFTs({
    chain: chain,
    address: userAddress,
    mediaItems: true,
  });

  const myNfts = nfts.raw.result.map((e, i) => {
    if (e?.media?.media_collection?.high?.url && !e.possible_spam && (e?.media?.category !== "video") ) {
      return e["media"]["media_collection"]["high"]["url"];
    }
  })

  const balance = await Moralis.EvmApi.balance.getNativeBalance({
    chain: chain,
    address: userAddress
  });

  const jsonResponse = {
    tokens: tokens.raw,
    nfts: myNfts,
    balance: balance.raw.balance / (10 ** 18)
  }


  return res.status(200).json(jsonResponse);
});

app.get("/gethistory", async (req,res) => {
  const { userAddress, chain } = req.query;

  const nativeTransactions = await Moralis.EvmApi.transaction.getWalletTransactions({
    chain: chain,
    address: userAddress
  })

  const tokenTransactions = await Moralis.EvmApi.token.getWalletTokenTransfers({
    chain: chain,
    address: userAddress
  })

  const jsonResponse = {
    nativeTransactions: nativeTransactions.result,
    tokenTransactions: tokenTransactions.result
  }


  return res.status(200).json(jsonResponse);
});

Moralis.start({
  apiKey: process.env.MORALIS_KEY,
}).then(() => {
  app.listen(port, () => {
    console.log(`Listening for API Calls`);
  });
});
