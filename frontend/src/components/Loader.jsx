import React, { useEffect, useState } from "react";

export default function Loader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHidden(true);
      document.body.style.overflow = "";
    }, 2000);

    document.body.style.overflow = "hidden";

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "";
    };
  }, []);

  if (hidden) return null;

  return (
    <div id="loader" className={hidden ? "hidden" : ""}>
      <div className="loader-inner">
        <div className="loader-logo">
          <img src="/img/logo.jpg" alt="Shree Sanwariya Travels Logo" className="loader-om" />
          <p className="loader-name">Shree Sanwariya Travels</p>
        </div>
        <div className="loader-bar">
          <div className="loader-fill"></div>
        </div>
      </div>
    </div>
  );
}
