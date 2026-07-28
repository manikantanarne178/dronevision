import { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function Login() {
  const [isLogin, setIsLogin] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const register = async () => {
    try {
      setLoading(true);

      await axios.post(`${API}/api/auth/register`, {
        username,
        email,
        password,
      });

      alert("Registration Successful. Please Login.");

      setIsLogin(true);
      setPassword("");
    } catch (err: any) {
      alert(
        err.response?.data?.detail || "Registration Failed"
      );
    } finally {
      setLoading(false);
    }
  };

const login = async () => {
  try {
    setLoading(true);

    const res = await axios.post(`${API}/api/auth/login`, {
      email,
      password,
    });

    console.log("LOGIN RESPONSE:", res.data);

    if (!res.data.access_token) {
      alert("No access_token returned from backend");
      console.log("Backend Response:", res.data);
      return;
    }

    localStorage.setItem("token", res.data.access_token);

    console.log(
      "Saved Token:",
      localStorage.getItem("token")
    );

    const me = await axios.get(`${API}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${res.data.access_token}`,
      },
    });

    console.log("ME:", me.data);

    if (me.data.username) {
      localStorage.setItem("username", me.data.username);
    }

    window.location.href = "/";
  } catch (err: any) {
    console.error("LOGIN ERROR:", err);

    if (err.response) {
      console.log("Status:", err.response.status);
      console.log("Response:", err.response.data);
    }

    alert(err.response?.data?.detail || "Invalid Credentials");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="h-screen flex justify-center items-center bg-slate-950">
      <div className="w-96 bg-slate-900 rounded-xl p-8 shadow-lg">

        <h1 className="text-3xl font-bold text-center text-white mb-6">
          DroneVision
        </h1>

        {!isLogin && (
          <input
            className="w-full p-3 rounded-lg mb-4 bg-slate-800 text-white"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        <input
          type="email"
          className="w-full p-3 rounded-lg mb-4 bg-slate-800 text-white"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 rounded-lg mb-6 bg-slate-800 text-white"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isLogin ? (
          <>
            <button
              onClick={login}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 py-3 rounded-lg font-semibold"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-center text-slate-400 mt-5">
              New User?{" "}
              <button
                className="text-cyan-400"
                onClick={() => setIsLogin(false)}
              >
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            <button
              onClick={register}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-lg font-semibold"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="text-center text-slate-400 mt-5">
              Already have an account?{" "}
              <button
                className="text-cyan-400"
                onClick={() => setIsLogin(true)}
              >
                Login
              </button>
            </p>
          </>
        )}

      </div>
    </div>
  );
}