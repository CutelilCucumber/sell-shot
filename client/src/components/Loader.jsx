export default function Loader() {
  const dotsStyle = {
    '--size': '64px',
    '--dot-size': '6px',
    '--dot-count': '6',
    '--color': '#fff',
    '--speed': '1s',
    '--spread': '60deg'
  };

  return (
    <div className="page-status">
      <div style={dotsStyle} className="dots">
        <div style={{ '--i': '0' }} className="dot"></div>
        <div style={{ '--i': '1' }} className="dot"></div>
        <div style={{ '--i': '2' }} className="dot"></div>
        <div style={{ '--i': '3' }} className="dot"></div>
        <div style={{ '--i': '4' }} className="dot"></div>
        <div style={{ '--i': '5' }} className="dot"></div>
      </div>
    </div>
  );
}