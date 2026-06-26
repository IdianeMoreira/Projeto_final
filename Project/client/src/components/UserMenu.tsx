import { useState, useRef, useEffect } from "react";

import userIcon
from "@/assets/user.png";

type Props = {

  setPage:
    React.Dispatch<
      React.SetStateAction<string>
    >;

  loggedUser: string;

  setLoggedUser:
    React.Dispatch<
      React.SetStateAction<string>
    >;

};

function UserMenu({
  setPage,
  loggedUser,
  setLoggedUser
}: Props) {

    const [showMenu, setShowMenu] =
        useState(false);

    const userRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {

        function handleClickOutside(
            event: MouseEvent
        ) {

            if (
            userRef.current &&
            !userRef.current.contains(
                event.target as Node
            )
            ) {

            setShowMenu(false);

            }

        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () =>
            document.removeEventListener(
            "mousedown",
            handleClickOutside
            );

        }, []);

        return (

        <div
            ref={userRef}
            className="relative flex items-center gap-2"
            onMouseEnter={() => setShowMenu(true)}
        >

            <img
            src={userIcon}
            className="
                w-10
                h-10
                cursor-pointer
            "
            onClick={() =>
                setShowMenu(!showMenu)
            }
            />

            {/* nome do utilizador */}
            {
            loggedUser !== "" && (

                <span className="font-medium">
                {loggedUser}
                </span>

            )
            }

            {

            showMenu && (

                <div
                className="
                    absolute
                    right-0
                    top-full
                    mt-1
                    bg-white
                    border
                    rounded-lg
                    shadow-lg
                    overflow-hidden
                    min-w-40
                    z-50
                "
                >

                {

                    loggedUser === "" ? (

                    <>
                        <button
                        className="
                            w-full
                            text-left
                            px-5
                            py-3
                            text-black
                            hover:bg-gray-100
                        "
                        onClick={() => {

                            setPage("login");
                            setShowMenu(false);

                        }}
                        >
                        Login
                        </button>

                        <button
                        className="
                            w-full
                            text-left
                            px-5
                            py-3
                            text-black
                            hover:bg-gray-100
                        "
                        onClick={() => {

                            setPage("register");
                            setShowMenu(false);

                        }}
                        >
                        Sign Up
                        </button>
                    </>

                    ) : (

                    <button
                        className="
                        w-full
                        text-left
                        px-5
                        py-3
                        hover:bg-gray-100
                        "
                        onClick={() => {

                        setLoggedUser("");
                        setPage("home");
                        setShowMenu(false);

                        }}
                    >
                        Logout
                    </button>

                    )

                }

                </div>

            )

            }

        </div>

        );
}

export default UserMenu;