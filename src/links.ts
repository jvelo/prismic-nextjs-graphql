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
 * Link resolver used by Primisc RichText component.
 */
export const linkResolver: (link: InternalLink) => string = link => {
    if (link.type === 'page') {
        return `/${link.uid}`;
    }

    return '';
};


/**
 * href resolver used by Primisc RichText component.
 */
export const hrefResolver: (doc: InternalLink) => string = doc => {
    if (doc.type === 'page') {
        return '/[slug]'
    }

    return '/'
};
