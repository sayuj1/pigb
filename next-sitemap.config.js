/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://pigb.sehgaltech.com', // your domain
    generateRobotsTxt: true, // also generate robots.txt
    sitemapSize: 7000,
    changefreq: 'weekly',
    priority: 0.7,
    autoLastmod: true,
    exclude: ['/404', '/500'], // optional
};
