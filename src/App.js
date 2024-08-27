import React, { useState, useEffect } from "react";
import Web3 from "web3";
import {
  ChainlinkPlugin,
  MainnetPriceFeeds,
} from "@chainsafe/web3-plugin-chainlink";
import "./App.css";

const App = () => {
  const [cryptos, setCryptos] = useState([
    {
      amount: 0,
      price: 0,
      name: "Eth",
      conversionAddress: MainnetPriceFeeds.EthUsd,
      label: "From",
    },
    {
      amount: 0,
      price: 0,
      name: "Btc",
      conversionAddress: MainnetPriceFeeds.BtcUsd,
      label: "To",
    },
  ]);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      try {
        const firstResult = await web3.chainlink.getPrice(
          cryptos[0].conversionAddress
        );
        const secondResult = await web3.chainlink.getPrice(
          cryptos[1].conversionAddress
        );

        // Converting the price to a more readable format (assuming 8 decimal places)
        const firstPrice = parseFloat(firstResult.answer) / 1e8;
        const secondPrice = parseFloat(secondResult.answer) / 1e8;

        setCryptos((prev) => [
          { ...prev[0], price: firstPrice },
          { ...prev[1], price: secondPrice },
        ]);
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoading(false);
      }
    };

    checkNetwork();
    fetchPrices();
  }, [cryptos[0].conversionAddress, cryptos[1].conversionAddress]);

  const handleConversion = () => {
    console.log("handleConversion called");
    if (cryptos[0].amount && cryptos[0].price && cryptos[1].price) {
      const conversionResult =
        (cryptos[0].amount * cryptos[0].price) / cryptos[1].price;
      console.log("Conversion result:", conversionResult);
      setCryptos((prev) => [prev[0], { ...prev[1], amount: conversionResult }]);
    } else {
      console.log("Missing data for conversion");
    }
  };

  // Filter MainnetPriceFeeds to include only those with "Usd" as the base currency
  const filteredPriceFeeds = Object.entries(MainnetPriceFeeds).filter(([key]) =>
    key.endsWith("Usd")
  );

  // Convert filteredPriceFeeds to an array of key-value pairs and strip "Usd" from keys
  const currencies = Array.from(
    new Set(
      filteredPriceFeeds.map(([key, value]) => {
        return {
          name: key.replace("Usd", ""),
          address: value,
        };
      })
    )
  );

  console.log("Currencies:", currencies);

  const handleInputChange = (index, field, value) => {
    setCryptos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div className="App">
      <h2>Crypto Price Converter</h2>
      <p style={{ marginBottom: 40, fontWeight: "bold" }}>
        (Convert between any two Cryptocurrencies)
      </p>

      <div style={{ display: "flex", gap: 5, justifyContent: "space-between" }}>
        {cryptos.map((crypto, index) => (
          <div key={index}>
            <label style={{ fontWeight: "bold", paddingBottom: 100 }}>
              {crypto.label}
            </label>
            <input
              style={{ marginBottom: 10, marginTop: 10 }}
              type="number"
              placeholder="amount"
              value={crypto.amount}
              onChange={(e) => {
                const amount = parseFloat(e.target.value);
                handleInputChange(index, "amount", amount);
              }}
            />
            <select
              value={crypto.name}
              onChange={(e) => {
                const selectedCurrency = currencies.find(
                  (currency) => currency.name === e.target.value
                );
                handleInputChange(index, "name", selectedCurrency.name);
                handleInputChange(
                  index,
                  "conversionAddress",
                  selectedCurrency.address
                );
              }}>
              {currencies.map((currency) => (
                <option key={currency.name + index} value={currency.name}>
                  {currency.name}
                </option>
              ))}
            </select>
            <p
              style={{
                marginBottom: 10,
                fontSize: 12,
                fontWeight: "bold",
                marginTop: 0,
              }}>
              {crypto.name}/USD:{" "}
              {loading
                ? "Loading..."
                : crypto.price
                ? `$${crypto.price.toFixed(2)}`
                : "Loading..."}
            </p>
          </div>
        ))}
      </div>
      <button onClick={handleConversion}>Convert</button>
      <p className="conversion-result">
        {cryptos[1].amount
          ? `Converted Amount: ${cryptos[1].amount.toFixed(2)} ${
              cryptos[1].name
            }`
          : ""}
      </p>
      <footer>
        <p>
          Made by{" "}
          <a
            href="https://github.com/jovells"
            target="_blank"
            rel="noopener noreferrer">
            Jovells
          </a>
        </p>
      </footer>
    </div>
  );
};

export default App;