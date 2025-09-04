import { useEffect } from "react";
import { TbBottleFilled } from "react-icons/tb";
import ReactDOMServer from "react-dom/server";

export default function Favicon() {
  useEffect(() => {
    // Convert the React icon to an SVG string
    const svgString = ReactDOMServer.renderToString(
      <TbBottleFilled color="#FFB800" size={24} />
    );

    // Create the favicon link
    const link =
      document.querySelector("link[rel*='icon']") ||
      document.createElement("link");
    link.type = "image/svg+xml";
    link.rel = "icon";
    link.href = `data:image/svg+xml;base64,${btoa(svgString)}`;

    // Add it to the document head
    document.head.appendChild(link);
  }, []);

  return null;
}
