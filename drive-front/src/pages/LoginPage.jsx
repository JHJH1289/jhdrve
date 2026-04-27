import { useState } from "react";
import { login, register } from "../api/authApi";

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      if (!username.trim() || !password.trim()) {
        throw new Error("아이디와 비밀번호를 입력하세요.");
      }

      if (mode === "register") {
        await register(username.trim(), password);
        setMessage("회원가입 완료. 이제 로그인하세요.");
        setMode("login");
      } else {
        const result = await login(username.trim(), password);
        localStorage.setItem("token", result.token);
        localStorage.setItem("username", result.username);
        onLoginSuccess(result.username);
      }
    } catch (error) {
      setMessage(error.message || "요청 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>사진 드라이브</h1>
        <p className="auth-subtitle">로그인 후 사진 갤러리를 사용할 수 있습니다.</p>

        <div className="auth-tabs">
          <button
            type="button"
            className={mode === "login" ? "tab active" : "tab"}
            onClick={() => setMode("login")}
          >
            로그인
          </button>
          <button
            type="button"
            className={mode === "register" ? "tab active" : "tab"}
            onClick={() => setMode("register")}
          >
            회원가입
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="row">
            <span>아이디</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디 입력"
            />
          </label>

          <label className="row">
            <span>비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 입력"
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
          </button>
        </form>

        {message && <div className="status-box">{message}</div>}
      </div>
    </div>
  );
}