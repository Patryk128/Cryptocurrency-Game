import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser, clearUser } from "../store/authSlice";
import { setBalance, setPortfolio, setPrices } from "../store/portfolioSlice";
import { toggleTheme } from "../store/themeSlice";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import {
  FaBitcoin,
  FaEthereum,
  FaDollarSign,
  FaSun,
  FaMoon,
  FaSync,
  FaArrowUp,
  FaArrowDown,
  FaMinus,
  FaPlus,
} from "react-icons/fa";
import { SiBinance, SiDogecoin, SiRipple } from "react-icons/si";
import { useNavigate } from "react-router-dom";
import Welcome from "./Welcome";
import "../styles/nav.css";
import "../styles/buttons.css";
import "../styles/popup.css";
import "../styles/modal.css";

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

const Popup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="popup">
      <p>{message}</p>
    </div>
  );
};

function Home() {
  const [amounts, setAmounts] = useState({});
  const [sellAmounts, setSellAmounts] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [popupMessage, setPopupMessage] = useState(null);
  const [trends, setTrends] = useState({});
  const [depositAmount, setDepositAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const {
    balance,
    portfolio = {},
    prices = {},
  } = useSelector((state) => state.portfolio);
  const { isDarkMode } = useSelector((state) => state.theme);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        dispatch(setUser(currentUser));
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
        } else {
          const initialData = {
            balance: 10000,
            portfolio: {},
            transactions: [],
          };
          await setDoc(userDocRef, initialData);
          dispatch(setBalance(initialData.balance));
          dispatch(setPortfolio(initialData.portfolio));
        }
      } else {
        dispatch(clearUser());
      }
    });

    const fetchPricesAndTrends = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,dogecoin,ripple&order=market_cap_desc&per_page=5&page=1&sparkline=false"
        );
        const data = response.data || [];

        const newPrices = {};
        data.forEach((coin) => {
          newPrices[coin.id] = { usd: coin.current_price };
        });
        dispatch(setPrices(newPrices));
        setLastUpdated(new Date().toLocaleTimeString());

        const newTrends = {};
        data.forEach((coin) => {
          const change24h = coin.price_change_percentage_24h;
          newTrends[coin.id] =
            change24h > 0 ? "up" : change24h < 0 ? "down" : "neutral";
        });
        setTrends(newTrends);
      } catch (error) {
        console.error("Error fetching prices or trends:", error);
      }
    };

    fetchPricesAndTrends();
    const interval = setInterval(fetchPricesAndTrends, 30000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [dispatch]);

  const handleAmountChange = (crypto, value, type) => {
    if (type === "buy") {
      setAmounts((prev) => ({ ...prev, [crypto]: value }));
    } else if (type === "sell") {
      setSellAmounts((prev) => ({ ...prev, [crypto]: value }));
    }
  };

  const showPopup = (message) => {
    setPopupMessage(message);
    setTimeout(() => setPopupMessage(null), 3000);
  };

  const buyCrypto = async (crypto) => {
    const amount = amounts[crypto];
    if (!amount || parseFloat(amount) <= 0) return;

    const cost = parseFloat(amount) * (prices[crypto]?.usd || 0);
    if (cost > balance) {
      showPopup("Insufficient funds!");
      return;
    }

    const newBalance = balance - cost;
    const newPortfolio = {
      ...portfolio,
      [crypto]: (portfolio[crypto] || 0) + parseFloat(amount),
    };
    const newTransaction = {
      type: "buy",
      crypto: cryptoList[crypto].name,
      amount: parseFloat(amount),
      price: prices[crypto]?.usd || 0,
      total: cost,
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
      setAmounts((prev) => ({ ...prev, [crypto]: "" }));
      showPopup(
        `Successfully bought ${formatNumber(amount)} ${
          cryptoList[crypto].name
        }!`
      );
    } catch (error) {
      console.error("Error updating document:", error);
      showPopup("An error occurred during purchase.");
    }
  };

  const depositFunds = async (amount) => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      showPopup("Please enter a valid deposit amount!");
      return;
    }

    const newBalance = balance + parsedAmount;
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        balance: newBalance,
      });
      dispatch(setBalance(newBalance));
      setDepositAmount("");
      setIsModalOpen(false);
      showPopup(`Successfully deposited ${formatNumber(parsedAmount)} USD!`);
    } catch (error) {
      console.error("Error depositing funds:", error);
      showPopup("An error occurred during deposit.");
    }
  };

  const handleDepositInputChange = (e) => {
    let value = e.target.value;

    value = value.replace(/[^0-9.]/g, "");
    const dotCount = value.split(".").length - 1;
    if (dotCount > 1) {
      const firstDotIndex = value.indexOf(".");
      value =
        value.substring(0, firstDotIndex + 1) +
        value.substring(firstDotIndex + 1).replace(/\./g, "");
    }

    const parts = value.split(".");
    if (parts[1] && parts[1].length > 2) {
      value = `${parts[0]}.${parts[1].slice(0, 2)}`;
    }

    setDepositAmount(value);
  };

  const handleDepositInputKeyPress = (e) => {
    if (e.key === "Enter") {
      depositFunds(depositAmount);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setDepositAmount("");
  };

  const getTrendIcon = (crypto) => {
    const trend = trends[crypto];
    if (!trend) return null;
    if (trend === "up") return <FaArrowUp className="trend-up" />;
    if (trend === "down") return <FaArrowDown className="trend-down" />;
    return <FaMinus className="trend-neutral" />;
  };

  if (!user) return <Welcome />;

  return (
    <div className="container">
      <nav className="navbar">
        <div className="nav-left">
          <h1>Cryptocurrency Game</h1>
        </div>
        <div className="nav-right">
          <button
            onClick={() => navigate("/portfolio")}
            className="portfolio-btn"
          >
            Portfolio & History
          </button>
          <p className="balance">
            <FaDollarSign /> {formatBalance(balance)} USD
          </p>
          <button onClick={openModal} className="deposit-btn">
            <FaPlus /> Deposit
          </button>
          <button
            onClick={() => dispatch(toggleTheme())}
            className="theme-toggle"
            title={
              isDarkMode ? "Switch to light theme" : "Switch to dark theme"
            }
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <button onClick={() => auth.signOut()} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      <div className="content">
        <div className="prices-header">
          <h2>Current Prices:</h2>
          <span className="last-updated">
            <FaSync /> Last updated: {lastUpdated || "Loading..."}
          </span>
        </div>
        <div className="prices">
          {Object.entries(cryptoList).map(([id, { name, icon }]) => (
            <div key={id} className="price-row">
              <div className="price-info">
                {icon} {name}:{" "}
                {prices[id]?.usd ? formatNumber(prices[id].usd) : "Loading..."}{" "}
                USD {getTrendIcon(id)}
              </div>
              <input
                type="number"
                step="0.00000001"
                min="0"
                value={amounts[id] || ""}
                onChange={(e) => handleAmountChange(id, e.target.value, "buy")}
                className="amount-input"
              />
              <button onClick={() => buyCrypto(id)} className="buy-btn">
                Buy
              </button>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Deposit Funds</h2>
            <div className="deposit-options">
              <button onClick={() => depositFunds(5)} className="deposit-btn">
                5$
              </button>
              <button onClick={() => depositFunds(10)} className="deposit-btn">
                10$
              </button>
              <button onClick={() => depositFunds(50)} className="deposit-btn">
                50$
              </button>
              <button onClick={() => depositFunds(100)} className="deposit-btn">
                100$
              </button>
              <button
                onClick={() => depositFunds(1000)}
                className="deposit-btn"
              >
                1000$
              </button>
            </div>
            <div className="custom-deposit">
              <input
                type="text"
                value={depositAmount}
                onChange={handleDepositInputChange}
                onKeyPress={handleDepositInputKeyPress}
                placeholder="Custom amount"
                className="deposit-input"
              />
              <button
                onClick={() => depositFunds(depositAmount)}
                className="custom-deposit-btn"
              >
                <FaPlus /> Deposit
              </button>
            </div>
            <button onClick={closeModal} className="close-modal-btn">
              Close
            </button>
          </div>
        </div>
      )}

      {popupMessage && (
        <Popup message={popupMessage} onClose={() => setPopupMessage(null)} />
      )}
    </div>
  );
}

export default Home;
