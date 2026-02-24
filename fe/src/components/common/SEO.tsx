import { Helmet } from "react-helmet-async";

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    author?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
}

const SEO = ({
    title,
    description,
    keywords = "CPL, OBE, Outcome Based Education, Kurikulum, Perguruan Tinggi, Capaian Pembelajaran Lulusan",
    author = "Sistem CPL",
    ogTitle,
    ogDescription,
    ogImage = "https://lovable.dev/opengraph-image-p98pqg.png",
    twitterCard = "summary_large_image",
}: SEOProps) => {
    const defaultTitle = "Sistem CPL - Pengukuran Capaian Pembelajaran Lulusan";
    const seoTitle = title ? `${title} | Sistem CPL` : defaultTitle;
    const seoDescription = description || "Platform modern untuk mengukur dan menganalisis Capaian Pembelajaran Lulusan dengan data akurat dan visualisasi informatif";

    return (
        <Helmet>
            <title>{seoTitle}</title>
            <meta name="description" content={seoDescription} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={ogTitle || seoTitle} />
            <meta property="og:description" content={ogDescription || seoDescription} />
            <meta property="og:image" content={ogImage} />

            {/* Twitter */}
            <meta name="twitter:card" content={twitterCard} />
            <meta name="twitter:title" content={ogTitle || seoTitle} />
            <meta name="twitter:description" content={ogDescription || seoDescription} />
            <meta name="twitter:image" content={ogImage} />
        </Helmet>
    );
};

export default SEO;
