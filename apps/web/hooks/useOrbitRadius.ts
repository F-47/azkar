import { useEffect, useState } from "react";

export default function useOrbitRadius() {
  const [radius, setRadius] = useState(240);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;

      if (w < 640) setRadius(200);
      else if (w < 1024) setRadius(260);
      else if (w < 1440) setRadius(300);
      else setRadius(380);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return radius;
}
