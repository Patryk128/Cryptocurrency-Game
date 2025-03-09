import { useSelector } from "react-redux";

function ThemeWrapper({ children }) {
  const { isDarkMode } = useSelector((state) => state.theme);

  return (
    <div className={isDarkMode ? "dark-mode" : "light-mode"}>{children}</div>
  );
}

export default ThemeWrapper;
