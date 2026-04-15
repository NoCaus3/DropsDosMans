export default function Metrics() {
  return (
    <section className="section is-large current-campaign">
      <div className="container">
        <div className="section-header">
          <h1 className="title">Drops Metrics</h1>
          <span className="subtitle">Current campaign statistics</span>
        </div>

        <div className="stats">
          <div className="stat-box">
            <div className="icon-container">
              <i className="mdi mdi-trophy" />
            </div>
            <h2 className="title stat-number drop-total-count">4,042,486</h2>
            <span className="subtitle">Drops Claimed</span>
          </div>
          <div className="stat-box">
            <div className="icon-container">
              <i className="mdi mdi-account-group" />
            </div>
            <h2 className="title stat-number drop-account-count">397,593</h2>
            <span className="subtitle">Participating Players</span>
          </div>
        </div>
      </div>
    </section>
  );
}
