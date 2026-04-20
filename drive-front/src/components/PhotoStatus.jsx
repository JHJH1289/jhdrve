function PhotoStatus({ statusText }) {
  return <div className="status-box">{statusText || "대기 중"}</div>;
}

export default PhotoStatus;