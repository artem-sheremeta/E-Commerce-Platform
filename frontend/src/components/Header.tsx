import React, { useState, useEffect } from "react";
import { loginUser, registerUser, Role } from "../api/auth";
import { useNavigate } from "react-router-dom";
import CartModal from "./CartModal";
import cartIcon from "./styles/cart-icon.png";
import userIcon from "./styles/avatar.png";
import "./styles/Header.css";
import axios from "axios";

const Header: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] =
    useState(false);

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const [role, setRole] = useState<Role | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [step, setStep] = useState<"requestCode" | "enterCode">("requestCode");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");

  const isValidRole = (role: string): role is Role => {
    return ["customer", "admin", "seller"].includes(role);
  };

  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const tokenGoogle = query.get("token");
    const roleFromQuery = query.get("role");

    const initGoogleLogin = async () => {
      if (tokenGoogle && roleFromQuery && isValidRole(roleFromQuery)) {
        try {
          localStorage.setItem("token", tokenGoogle);
          localStorage.setItem("role", roleFromQuery);
          setRole(roleFromQuery);
          setIsAuthenticated(true);

          const res = await axios.get("http://localhost:3000/users/me", {
            headers: { Authorization: `Bearer ${tokenGoogle}` },
          });

          const user = res.data;
          localStorage.setItem("userId", user.id.toString());

          navigate("/");
        } catch (err) {
          console.error("❌ Failed to fetch user:", err);
        }
      } else {
        const token = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role") as Role | null;

        if (token && storedRole) {
          setRole(storedRole);
          setIsAuthenticated(true);
        }
      }
    };

    initGoogleLogin();
  }, []);

  const resetLoginFields = () => {
    setLogin("");
    setPassword("");
    setError("");
    setSuccessMessage("");
  };

  const resetRegisterFields = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("customer");
    setError("");
    setSuccessMessage("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await loginUser(login, password);
      localStorage.setItem("token", response.access_token);
      localStorage.setItem("role", response.user.role);
      setRole(response.user.role);
      setIsAuthenticated(true);
      setSuccessMessage("Login successful!");
      setError("");
      resetLoginFields();
      setIsLoginModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerUser(username, email, password, role || "customer");
      setSuccessMessage("Registration successful! Please login.");
      setError("");
      resetRegisterFields();
      setIsRegisterModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    setRole(null);
    setSuccessMessage("");
    setError("");
    navigate("/");
  };

  const resetForgotPasswordFields = () => {
    setForgotPasswordEmail("");
    setError("");
    setSuccessMessage("");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:3000/auth/request-password-reset",
        { email: forgotPasswordEmail }
      );
      setResetToken(response.data.token);
      setStep("enterCode");
      setSuccessMessage("A reset code has been sent to your email.");
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset link.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/auth/reset-password", {
        token: resetToken,
        code: resetCode,
        newPassword,
      });
      setSuccessMessage("Password reset successfully! You can now log in.");
      setError("");
      resetForgotPasswordFields();
      setIsForgotPasswordModalOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired reset code.");
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    } else {
      alert("Search query cannot be empty.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          <button
            onClick={() => navigate("/")}
            style={{ all: "unset", cursor: "pointer" }}
          >
            <div className="header-title">ECOMMERCE-PLATFORM</div>
          </button>

          <div className="header-search">
            <input
              type="text"
              placeholder="Я шукаю..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value || "")}
              onKeyPress={handleKeyPress}
            />
            <button className="search-button" onClick={handleSearch}>
              Search
            </button>
          </div>

          <div className="header-buttons">
            <button
              className="header-button cart-button"
              onClick={() => setIsCartModalOpen(true)}
            >
              <img src={cartIcon} alt="Cart" className="cart-icon" />
            </button>

            {!isAuthenticated ? (
              <>
                <div className="header-buttons">
                  <button
                    className="header-button login-button"
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsRegisterModalOpen(false);
                    }}
                  >
                    Log In
                  </button>
                  <button
                    className="header-button signup-button"
                    onClick={() => {
                      setIsRegisterModalOpen(true);
                      setIsLoginModalOpen(false);
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="header-buttons">
                  <button
                    className="profile-button"
                    onClick={() => navigate(`/personal-information`)}
                  >
                    <img src={userIcon} alt="Profile" className="icon" />
                  </button>
                  {role === "seller" && (
                    <>
                      <button
                        className="header-button role-seller"
                        onClick={() => navigate("/create-product")}
                      >
                        Створити продукт
                      </button>
                      <button
                        className="header-button role-seller"
                        onClick={() => navigate("/my-products")}
                      >
                        Мої товари
                      </button>
                      <button
                        className="header-button role-seller"
                        onClick={() => navigate("/inbox")}
                      >
                        Повідомлення
                      </button>
                    </>
                  )}
                  {role === "admin" && (
                    <>
                      <button
                        className="header-button role-admin"
                        onClick={() => navigate("/users")}
                      >
                        Користувачі
                      </button>
                      <button
                        className="header-button role-admin"
                        onClick={() => navigate("/inbox")}
                      >
                        Повідомлення
                      </button>
                    </>
                  )}

                  <button className="header-button exit" onClick={handleLogout}>
                    EXIT
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {isCartModalOpen && (
        <CartModal
          onClose={() => setIsCartModalOpen(false)}
          isAuthenticated={isAuthenticated}
        />
      )}

      {isForgotPasswordModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => {
                resetForgotPasswordFields();
                setIsForgotPasswordModalOpen(false);
                setStep("requestCode");
              }}
              title="Close"
            >
              ✖
            </button>
            <h2>Forgot Password</h2>

            {step === "requestCode" && (
              <form onSubmit={handleForgotPassword}>
                <div className="input-container">
                  <span className="icon">📧</span>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    required
                  />
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {successMessage && (
                  <p style={{ color: "green" }}>{successMessage}</p>
                )}
                <button type="submit" className="submit-button">
                  Send Reset Code
                </button>
              </form>
            )}

            {step === "enterCode" && (
              <form onSubmit={handleResetPassword}>
                <div className="input-container">
                  <span className="icon">🔑</span>
                  <input
                    type="text"
                    placeholder="Enter the 6-digit code"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                  />
                </div>
                <div className="input-container">
                  <span className="icon">🔒</span>
                  <input
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {successMessage && (
                  <p style={{ color: "green" }}>{successMessage}</p>
                )}
                <button type="submit" className="submit-button">
                  Reset Password
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => {
                resetLoginFields();
                setIsLoginModalOpen(false);
              }}
              title="Закрити"
            >
              ✖
            </button>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div className="input-container">
                <span className="icon">👤</span>
                <input
                  type="text"
                  placeholder="Username or Email"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                />
              </div>
              <div className="input-container">
                <span className="icon">🔒</span>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                className="google-login-button"
                onClick={() =>
                  (window.location.href = "http://localhost:3000/auth/google")
                }
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
                  alt="Google logo"
                  style={{
                    width: "51px",
                    marginRight: "8px",
                    verticalAlign: "middle",
                  }}
                />
                Sign in with Google
              </button>

              {error && <p style={{ color: "red" }}>{error}</p>}
              {successMessage && (
                <p style={{ color: "green" }}>{successMessage}</p>
              )}
              <div className="button-container">
                <button type="submit" className="submit-button">
                  Login
                </button>
                <div className="switch-to-login">
                  <button
                    className="sign-up-button"
                    type="button"
                    onClick={() => {
                      resetLoginFields();
                      setIsLoginModalOpen(false);
                      setIsRegisterModalOpen(true);
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
              <button
                type="button"
                className="forgot-password-button"
                onClick={() => {
                  setIsLoginModalOpen(false);
                  setIsForgotPasswordModalOpen(true);
                }}
              >
                Forgot Password?
              </button>
            </form>
          </div>
        </div>
      )}

      {isRegisterModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => {
                resetRegisterFields();
                setIsRegisterModalOpen(false);
              }}
              title="Закрити"
            >
              ✖
            </button>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <div className="input-container">
                <span className="icon">👤</span>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="input-container">
                <span className="icon">📧</span>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-container">
                <span className="icon">🔒</span>
                <input
                  type="password"
                  placeholder="Create password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                className="google-login-button"
                onClick={() =>
                  (window.location.href = "http://localhost:3000/auth/google")
                }
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
                  alt="Google logo"
                  style={{
                    width: "18px",
                    marginRight: "8px",
                    verticalAlign: "middle",
                  }}
                />
                Sign in with Google
              </button>

              <div className="role-selection">
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="customer"
                    checked={role === "customer"}
                    onChange={(e) => setRole(e.target.value as Role)}
                  />
                  Customer — Для користувачів які, бажають придбати товар
                </label>
                <label>
                  <input
                    type="radio"
                    name="role"
                    value="seller"
                    checked={role === "seller"}
                    onChange={(e) => setRole(e.target.value as Role)}
                  />
                  Seller — Для користувачів які, бажають продати свій товар
                </label>
              </div>
              {error && <p style={{ color: "red" }}>{error}</p>}
              {successMessage && (
                <p style={{ color: "green" }}>{successMessage}</p>
              )}
              <div className="button-container">
                <button type="submit" className="submit-button">
                  Create account
                </button>
                <div className="switch-to-login">
                  <button
                    className="sign-up-button"
                    type="button"
                    onClick={() => {
                      resetRegisterFields();
                      setIsRegisterModalOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
