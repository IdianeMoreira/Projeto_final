
import { useState } from "react";
import { login } from "@/services/api";

// Props para o componente LoginPage
type Props = {

  setPage: (
    page: string
  ) => void;

  setLoggedUser:
    React.Dispatch<
      React.SetStateAction<string>
    >;

};

// Componente LoginPage que exibe o formulário de login
function LoginPage({ setPage, setLoggedUser }: Props) {

    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [message, setMessage] =
        useState("");

    async function handleLogin() {

        const response =
            await login(
            username,
            password
            );

        if (response.success) {

            setLoggedUser(username);

            localStorage.setItem("loggedUser", username);

            setMessage("Login successful");

            setTimeout(() => {setPage("home");}, 1000);

        } else {

            setMessage("Invalid username or password"
);

        }

    }

    return (

        <div className="
        flex
        justify-center
        mt-20
        ">

        <div className="
            w-full
            max-w-md
            border
            rounded-xl
            p-8
            shadow
        ">

            <h1 className="
            text-3xl
            font-bold
            mb-8
            ">

            Login

            </h1>

            <div className="space-y-6">

            <div>

                <label>
                Username
                </label>

                <input
                type="text"
                value={username}
                onChange={(e) =>
                    setUsername(
                    e.target.value
                    )
                }
                className="
                    w-full
                    border
                    rounded-md
                    p-2
                    mt-2
                "
                />

            </div>

            <div>

                <label>
                Password
                </label>

                <input
                type="password"
                value={password}
                onChange={(e) =>
                    setPassword(
                    e.target.value
                    )
                }
                className="
                    w-full
                    border
                    rounded-md
                    p-2
                    mt-2
                "
                />

            </div>

            <button
                className="
                w-full
                bg-black
                text-white
                rounded-md
                p-3
                "
                onClick={handleLogin}
            >

                Login

            </button>

            {
                message && (

                <p
                    className={`
                    text-center
                    ${
                        message ===
                        "Login successful"

                        ? "text-green-600"

                        : "text-red-500"
                    }
                    `}
                >

                    {message}

                </p>

                )
            }

            <div className="mt-6 text-center">

                <p className="text-gray-500">

                Don't have an account?

                </p>

                <button
                className="
                    text-blue-600
                    hover:underline
                    mt-2
                "
                onClick={() =>
                    setPage("register")
                }
                >

                Sign Up

                </button>

            </div>

            </div>

        </div>

        </div>

    );
}

export default LoginPage;