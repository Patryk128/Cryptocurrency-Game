import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setBalance, setPortfolio } from "../store/portfolioSlice";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  FaBitcoin,
  FaEthereum,
  FaDollarSign,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { SiBinance, SiDogecoin, SiRipple } from "react-icons/si";

const cryptoList = {
  bitcoin: { name: "Bitcoin", icon: <FaBitcoin /> },
  ethereum: { name: "Ethereum", icon: <FaEthereum /> },
  binancecoin: { name: "BNB", icon: <SiBinance /> },
  dogecoin: { name: "Dogecoin", icon: <SiDogecoin /> },
  ripple: { name: "XRP", icon: <SiRipple /> },
};

const formatNumber = (num) => {
  if (!num) return "0";
  const parsed = parseFloat(num);
  if (parsed === 0) return "0";
  return parsed
    .toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    })
    .replace(/\.0+$/, "");
};

const formatBalance = (num) => {
  if (!num) return "0.00";
  return parseFloat(num).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

function Portfolio() {
  const [showPortfolio, setShowPortfolio] = useState(true);
  const [sellAmounts, setSellAmounts] = useState({});
  const [transactions, setTransactions] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    balance,
    portfolio = {},
    prices = {},
  } = useSelector((state) => state.portfolio);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          dispatch(setBalance(data.balance || 0));
          const cleanedPortfolio = {};
          Object.entries(data.portfolio || {}).forEach(([key, value]) => {
            if (value > 0) cleanedPortfolio[key] = value;
          });
          dispatch(setPortfolio(cleanedPortfolio));
          setTransactions(data.transactions || []);
        }
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [dispatch, navigate]);

  const handleAmountChange = (crypto, value) => {
    setSellAmounts((prev) => ({ ...prev, [crypto]: value }));
  };

  const sellCrypto = async (crypto, sellAll = false) => {
    let amount = sellAll ? portfolio[crypto] : sellAmounts[crypto];
    if (!amount || parseFloat(amount) <= 0 || !portfolio[crypto]) {
      alert("Enter a valid amount to sell!");
      return;
    }

    if (parseFloat(amount) > portfolio[crypto]) {
      alert("You don't have enough cryptocurrency to sell!");
      return;
    }

    const value = parseFloat(amount) * (prices[crypto]?.usd || 0);
    const newBalance = balance + value;
    const newPortfolio = { ...portfolio };
    newPortfolio[crypto] = portfolio[crypto] - parseFloat(amount);

    if (newPortfolio[crypto] <= 0) {
      delete newPortfolio[crypto];
    }

    const newTransaction = {
      type: "sell",
      crypto: cryptoList[crypto].name,
      amount: parseFloat(amount),
      price: prices[crypto]?.usd || 0,
      total: value,
      date: new Date().toISOString(),
    };

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const currentData = userDoc.exists() ? userDoc.data() : {};
      const updatedTransactions = [
        newTransaction,
        ...(currentData.transactions || []),
      ].slice(0, 50);

      await updateDoc(userDocRef, {
        balance: newBalance,
        portfolio: newPortfolio,
        transactions: updatedTransactions,
      });
      dispatch(setBalance(newBalance));
      dispatch(setPortfolio(newPortfolio));
      setTransactions(updatedTransactions);
      setSellAmounts((prev) => ({ ...prev, [crypto]: "" }));
    } catch (error) {
      console.error("Error updating document:", error);
      alert("An error occurred during sale.");
    }
  };

  const sellAllCrypto = (crypto) => {
    setSellAmounts((prev) => ({
      ...prev,
      [crypto]: portfolio[crypto]?.toString() || "",
    }));
    sellCrypto(crypto, true);
  };

  if (!user) return null;

  return (
    <div className="container">
      <nav className="navbar">
        <div className="nav-left">
          <h1>Portfolio & History</h1>
        </div>
        <div className="nav-right">
          <button onClick={() => navigate("/")} className="home-btn">
            Strona główna
          </button>
          <p className="balance">
            <FaDollarSign /> {formatBalance(balance)} USD
          </p>
          <button onClick={() => auth.signOut()} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="content">
        <div className="portfolio-nav">
          <div className="portfolio-header">
            <h2>Your Portfolio:</h2>
            <button
              onClick={() => setShowPortfolio(!showPortfolio)}
              className="toggle-portfolio-btn"
              title={showPortfolio ? "Hide portfolio" : "Show portfolio"}
            >
              {showPortfolio ? <FaEyeSlash /> : <FaEye />}
              {showPortfolio ? " Hide" : " Show"}
            </button>
          </div>
          {showPortfolio && (
            <div className="portfolio-items">
              {Object.entries(cryptoList)
                .filter(([id]) => portfolio[id] > 0)
                .map(([id, { name, icon }]) => (
                  <div key={id} className="portfolio-item">
                    <span>
                      {icon} {formatNumber(portfolio[id])}
                    </span>
                    <input
                      type="number"
                      step="0.00000001"
                      min="0"
                      value={sellAmounts[id] || ""}
                      onChange={(e) => handleAmountChange(id, e.target.value)}
                      placeholder="Amount"
                      className="amount-input"
                    />
                    <button
                      onClick={() => sellCrypto(id)}
                      className="sell-btn"
                      disabled={!portfolio[id] || portfolio[id] <= 0}
                    >
                      Sell
                    </button>
                    <button
                      onClick={() => sellAllCrypto(id)}
                      className="sell-all-btn"
                      disabled={!portfolio[id] || portfolio[id] <= 0}
                    >
                      Sell All
                    </button>
                  </div>
                ))}
              {Object.keys(portfolio).every((id) => portfolio[id] <= 0) && (
                <span className="empty-portfolio">No currencies</span>
              )}
            </div>
          )}
        </div>

        <div className="transactions-section">
          <h2>Transaction History</h2>
          {transactions.length > 0 ? (
            <ul className="transactions-list">
              {transactions.map((tx, index) => (
                <li key={index} className={`transaction-item ${tx.type}`}>
                  <span>
                    {tx.type === "buy" ? "Buy" : "Sell"}: {tx.crypto} -{" "}
                    {formatNumber(tx.amount)} @ {formatNumber(tx.price)} USD ={" "}
                    {formatBalance(tx.total)} USD
                  </span>
                  <span className="transaction-date">
                    {new Date(tx.date).toLocaleString("en-US")}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No transactions.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
