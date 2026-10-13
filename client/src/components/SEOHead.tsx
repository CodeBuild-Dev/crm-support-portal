import { useEffect } from "react";

interface SEOHeadProps {
  title?: string;
  description?: string;
}

const SEOHead = ({ title, description }: SEOHeadProps) => {
  useEffect(() => {
    const base = "CRM Support Portal";
    document.title = title ? `${title} | ${base}` : base;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && description) {
      metaDesc.setAttribute("content", description);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title || base);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) ogDesc.setAttribute("content", description);
  }, [title, description]);

  return null;
};

export default SEOHead;
