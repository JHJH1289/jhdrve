export default function PhotoStatus({ status }) {
  if (!status) return null;
  return <div className="status-box">{status}</div>;
}