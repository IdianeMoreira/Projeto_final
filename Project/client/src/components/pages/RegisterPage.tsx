import { register } from "@/services/api";
import { useState } from "react";

type Props = {
  setPage: (
    page: string
  ) => void;
};

function RegisterPage({ setPage }: Props) {

    // estados
    const [username, setUsername] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [message, setMessage] =
        useState("");

    // função chamada pelo botão
    async function handleRegister() {

        console.log("Botão clicado");

        if (password !== confirmPassword) {

            setMessage("Passwords do not match");
            return;
        }

        const response =
            await register(
            username,
            password
            );

        console.log(response);

        if (response.success) {

            setMessage(
                "Account created successfully! Redirecting to login..."
            );

            // Espera 1 segundo para o utilizador ver a mensagem
            setTimeout(() => {

                setPage("login");

            }, 1000);

            } else {

                setMessage(
                    "Username already exists"
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

                Sign Up

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

                <div>

                <label>
                    Confirm Password
                </label>

                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                    setConfirmPassword(
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
                onClick={handleRegister}
                >

                Create Account

                </button>

                {
                message && (

                    <p
                        className={`text-center ${
                            message.includes("successfully")
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                    >
                        {message}
                    </p>
                )
                }

                <div className="mt-6 text-center">

                <p className="text-gray-500">
                    Already have an account?
                </p>

                <button
                    className="
                    text-blue-600
                    hover:underline
                    mt-2
                    "
                    onClick={() =>
                    setPage("login")
                    }
                >
                    Login
                </button>

                </div>

            </div>

            </div>

        </div>

    );
}

export default RegisterPage;