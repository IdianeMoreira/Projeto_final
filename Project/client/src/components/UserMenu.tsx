import { useState, useRef, useEffect } from "react";
import userIcon from "@/assets/user.png";

// Props para o componente UserMenu
type Props = {
  setPage: (page: string) => void;
  loggedUser: string;
  setLoggedUser: React.Dispatch<React.SetStateAction<string>>;
};

// Componente UserMenu que exibe o menu de utilizador com opções de login, registo e logout
function UserMenu({ setPage, loggedUser, setLoggedUser }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={userRef}
      className="relative flex items-center gap-2"
      onMouseEnter={() => setShowMenu(true)}
    >
      <img
        src={userIcon}
        className="w-10 h-10 cursor-pointer"
        onClick={() => setShowMenu(!showMenu)}
      />

      {loggedUser !== "" && (
        <span className="font-medium text-white">{loggedUser}</span>
      )}

      {showMenu && (
        <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg overflow-hidden min-w-26 z-50">

          {loggedUser === "" ? (
            <>
              <button
                className="w-full text-left px-5 py-3 text-black hover:bg-gray-100"
                onClick={() => { setPage("login"); setShowMenu(false); }}
              >
                Login
              </button>
              <button
                className="w-full text-left px-5 py-3 text-black hover:bg-gray-100"
                onClick={() => { setPage("register"); setShowMenu(false); }}
              >
                Sign Up
              </button>
            </>
          ) : (
            <button
              className="w-full text-left px-5 py-3 text-black hover:bg-gray-100"
              onClick={() => { setLoggedUser(""); localStorage.removeItem("loggedUser"); setPage("home"); setShowMenu(false); }}
            >
              Logout
            </button>
          )}

        </div>
      )}
    </div>
  );
}

export default UserMenu;