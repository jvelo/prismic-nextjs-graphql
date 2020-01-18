type InternalLink = {
  id: string;
  type: string;
  tags: string[];
  slug: string;
  lang: string;
  uid: string;
  link_type: string;
  isBroken: boolean;
};

/**
 * Link resolver: transform prismic internal link to a relative URI
 */
export const linkResolver: (link: InternalLink) => string = link => {
  if (link.type === "page") {
    return `/${link.uid}`;
  }

  return "";
};

/**
 * Link resolver: transform prismic internal link to Next.js page URI
 */
export const hrefResolver: (doc: InternalLink) => string = doc => {
  if (doc.type === "page") {
    return "/[slug]";
  }

  return "/";
};
