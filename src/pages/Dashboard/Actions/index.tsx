import * as React from "react";
import * as Dapp from "@elrondnetwork/dapp";
import {
  Address,
  AddressValue,
  ContractFunction,
  SmartContract,
  Query,
} from "@elrondnetwork/erdjs";
import { contractAddress } from "config";
import { RawTransactionType } from "helpers/types";
import useNewTransaction from "pages/Transaction/useNewTransaction";
import { routeNames } from "routes";

const Actions = () => {
  const sendTransaction = Dapp.useSendTransaction();
  const { address, dapp } = Dapp.useContext();
  const newTransaction = useNewTransaction();

  const [nftsMinted, setNftsMinted] = React.useState(0);
  const [quantity, setQuantity] = React.useState(1);

  const getInfo = async () => {
    const contract = new SmartContract({
      address: new Address(contractAddress),
    });
    const response = await contract.runQuery(dapp.proxy, {
      func: new ContractFunction("getAvailableNFTs"),
    });
    const buf = Buffer.from(response.returnData[0], "base64");
    setNftsMinted(parseInt(buf.toString("hex"), 16) - 500);
  };

  React.useEffect(() => {
    getInfo();
  }, []);

  const send =
    (transaction: RawTransactionType) => async (e: React.MouseEvent) => {
      const co = "8BITHEROES-bcbc9f";
      const data = await fetch(
        `https://devnet-api.elrond.com/accounts/${address}/nfts?size=100&collections=${co}`,
      ).then((res) => res.json());
      let count = 0;
      for (const nft in data) {
        if (data[nft]["nonce"] >= 1001 && data[nft]["nonce"] <= 1500) {
          count++;
        }
      }

      if (count >= 20) alert("You've already minted 20 NFTs");
      else if (count + quantity > 20)
        alert(
          `You cannot mint ${quantity} NFTs as you have already minted ${count} NFTs`,
        );
      else {
        transaction.value = `${quantity * 0.3}`;
        e.preventDefault();
        sendTransaction({
          transaction: newTransaction(transaction),
          callbackRoute: routeNames.transaction,
        });
      }
    };

  const mintTransaction: RawTransactionType = {
    receiver: contractAddress,
    data: "mint",
    value: "0.3",
    gasLimit: 10000000,
  };

  const handleChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const self = event.target as HTMLElement;
    if (self.id === "minus") {
      if (quantity > 1) setQuantity(quantity - 1);
    } else if (self.id === "plus") {
      if (quantity < 20) setQuantity(quantity + 1);
    }
  };

  return (
    <div className="text-white">
      <div className="input-qty">
        <button id="minus" onClick={handleChange}>
          -
        </button>
        <span>{quantity}</span>
        <button id="plus" onClick={handleChange}>
          +
        </button>
      </div>
      <button className="mint-btn" onClick={send(mintTransaction)}>
        Mint
      </button>
      <div>{nftsMinted}/500 NFTs minted</div>
    </div>
  );
};

export default Actions;
