import React, { useState, useEffect } from "react";
import Web3 from "web3";
import {
  ChainlinkPlugin,
  MainnetPriceFeeds,
} from "@chainsafe/web3-plugin-chainlink";
import "./App.css";

const App = () => {
  const [amount, setAmount] = useState("");
  const [conversion, setConversion] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("ETH");
  const [firstCrypto, setFirstCrypto] = useState(null);
  const [secondCrypto, setSecondCrypto] = useState(null);

  // Initialize web3 and register plugin
  const web3 = new Web3(window.ethereum);
  web3.registerPlugin(new ChainlinkPlugin());

  useEffect(() => {
    const checkNetwork = async () => {
      const networkId = await web3.eth.net.getId();
      console.log("Network ID:", networkId);
      if (networkId !== 1n) {
        alert("Please switch to the Ethereum Mainnet to use this application.");
      }
    };

    const fetchPrices = async () => {
      try {
        const ethResult = await web3.chainlink.getPrice(
          MainnetPriceFeeds.EthUsd
        );
        const btcResult = await web3.chainlink.getPrice(
          MainnetPriceFeeds.BtcUsd
        );

        // Converting the price to a more readable format (assuming 8 decimal places)
        const ethPrice = parseFloat(ethResult.answer) / 1e8;
        const btcPrice = parseFloat(btcResult.answer) / 1e8;

        setFirstCrypto(ethPrice);
        setSecondCrypto(btcPrice);
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    };

    checkNetwork();
    fetchPrices();
  }, [web3]);

  const handleConversion = () => {
    if (firstCrypto && secondCrypto && amount) {
      let conversionResult;
      if (selectedCrypto === "ETH") {
        conversionResult = (amount * firstCrypto) / secondCrypto;
        setConversion(`${amount} ETH = ${conversionResult.toFixed(6)} BTC`);
      } else if (selectedCrypto === "BTC") {
        conversionResult = (amount * secondCrypto) / firstCrypto;
        setConversion(`${amount} BTC = ${conversionResult.toFixed(6)} ETH`);
      }
    }
  };

  return (
    <div className="App">
      <h2>Crypto Price Converter</h2>
      <p>
        ETH/USD: {firstCrypto ? `$${firstCrypto.toFixed(2)}` : "Loading..."}
      </p>
      <p>
        BTC/USD: {secondCrypto ? `$${secondCrypto.toFixed(2)}` : "Loading..."}
      </p>

      <div>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          value={selectedCrypto}
          onChange={(e) => setSelectedCrypto(e.target.value)}>
          <option value="ETH">ETH</option>
          <option value="BTC">BTC</option>
        </select>
        <button onClick={handleConversion}>Convert</button>
      </div>

      {conversion && <p>{conversion}</p>}
    </div>
  );
};

export default App;
