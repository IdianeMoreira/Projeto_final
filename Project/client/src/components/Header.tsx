import { useState, useRef, useEffect } from "react";

import UserMenu from "./UserMenu";

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

function Header({
  setPage,
  loggedUser,
  setLoggedUser
}: Props) {

    const [showGraphs, setShowGraphs] =
        useState(false);

    const graphsRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {

    function handleClickOutside(
        event: MouseEvent
    ) {

        if (
        graphsRef.current &&
        !graphsRef.current.contains(
            event.target as Node
        )
        ) {

        setShowGraphs(false);

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
      className="
        flex
        flex-col
        md:flex-row
        justify-between
        items-center
        gap-6
        mb-10
        bg-[rgba(45,125,144,0.6)]
        rounded-2xl
        p-8
      "
    >

      <h1
        className="
        text-4xl
        font-bold
        text-white
        "
      >
        Smart Occupancy Dashboard
      </h1>

      <div
        className="
        flex
        gap-8
        items-center
        text-white
        font-semibold
        flex-wrap
        "
      >

        {/* HOME */}
        <button
          className="
          hover:text-gray-300
          transition-colors
          "
          onClick={() =>
            setPage("home")
          }
        >
          Home
        </button>

        {/* GRAPHS */}
            <div

            ref={graphsRef}

            className="relative"

            onMouseEnter={() =>
                setShowGraphs(true)
            }

            >

            <button

              className="
                hover:text-gray-300
                transition-colors
              "

              onClick={() =>
                  setShowGraphs(
                  !showGraphs
                  )
              }

              >

              Graphs

            </button>

          {
            showGraphs && (

            <div
                className="
                    absolute
                    top-full
                    mt-1
                    right-0
                    bg-white
                    text-black
                    border
                    rounded-lg
                    shadow-lg
                    overflow-hidden
                    min-w-52
                    z-50
                "
            >

            <button
                className="
                block
                w-full
                px-6
                py-3
                text-left
                hover:bg-gray-100
                "
                onClick={() =>
                setPage("dailyAverage")
                }
            >
                Daily Average
            </button>

            <button
                className="
                block
                w-full
                px-6
                py-3
                text-left
                hover:bg-gray-100
                "
                onClick={() =>
                setPage("dailyFlow")
                }
            >
                Daily Flow
            </button>

            <button
                className="
                block
                w-full
                px-6
                py-3
                text-left
                hover:bg-gray-100
                "
                onClick={() =>
                setPage("week")
                }
            >
                Last Week
            </button>

            <button
                className="
                block
                w-full
                px-6
                py-3
                text-left
                hover:bg-gray-100
                "
                onClick={() =>
                setPage("twoWeeks")
                }
            >
                Last Two Weeks
            </button>

            <button
                className="
                block
                w-full
                px-6
                py-3
                text-left
                hover:bg-gray-100
                "
                onClick={() =>
                setPage("month")
                }
            >
                Last Month
            </button>

              </div>

            )
          }

        </div>

        {/* USER MENU */}
        <UserMenu
          setPage={setPage}
          loggedUser={loggedUser}
          setLoggedUser={setLoggedUser}
        />

      </div>

    </div>

  );
}

export default Header;