import React from 'react';
import Layout from '../components/Layout';
import './PolicyPage.css';

// Renders body text — splits on bullet points if present
const PolicyBody = ({ text }) => {
    if (!text.includes('•')) {
        return <p className="policy-page__section-body">{text}</p>;
    }

    const [intro, ...bullets] = text.split('•').map((s) => s.trim()).filter(Boolean);

    // Check if last bullet contains a trailing sentence after the final point
    const lastBullet = bullets[bullets.length - 1];
    const trailingMatch = lastBullet?.match(/^(.+?)\n\n(.+)$/s);
    let cleanedBullets = [...bullets];
    let trailing = null;

    if (trailingMatch) {
        cleanedBullets[cleanedBullets.length - 1] = trailingMatch[1].trim();
        trailing = trailingMatch[2].trim();
    }

    return (
        <div className="policy-page__section-body">
            {intro && <p className="policy-page__body-intro">{intro}</p>}
            <ul className="policy-page__bullet-list">
                {cleanedBullets.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
            {trailing && <p className="policy-page__body-trailing">{trailing}</p>}
        </div>
    );
};

// --- icons and ContactCard unchanged ---
const icons = {
    trade: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
    ),
    phone: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07
                A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4
                2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72
                c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81
                a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45
                c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16z" />
        </svg>
    ),
    email: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4
                c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
        </svg>
    ),
    address: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    tin: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12
                a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
        </svg>
    ),
};

const ContactCard = ({ icon, label, value, wide }) => (
    <div className={`policy-page__contact-card${wide ? ' policy-page__contact-card--wide' : ''}`}>
        <div className="policy-page__contact-icon">{icon}</div>
        <div className="policy-page__contact-text">
            <span className="policy-page__contact-label">{label}</span>
            <span className="policy-page__contact-value">{value}</span>
        </div>
    </div>
);

const PolicyPage = ({ data, type }) => {
    if (type === 'contact') {
        return (
            <Layout>
                <div className="policy-page">
                    <h1 className="policy-page__title">{data.title}</h1>
                    <div className="policy-page__contact-grid">
                        <ContactCard
                            icon={icons.trade}
                            label="Trade Name"
                            value={data.details.find((d) => d.label === 'Trade Name')?.value}
                        />
                        <ContactCard
                            icon={icons.phone}
                            label="Phone Number"
                            value={data.details.find((d) => d.label === 'Phone Number')?.value}
                        />
                        <ContactCard
                            icon={icons.email}
                            label="Email"
                            value={data.details.find((d) => d.label === 'Email')?.value}
                        />
                        <ContactCard
                            icon={icons.tin}
                            label="TIN"
                            value={data.details.find((d) => d.label === 'TIN')?.value}
                        />
                        <ContactCard
                            icon={icons.address}
                            label="Physical Address"
                            value={data.details.find((d) => d.label === 'Physical Address')?.value}
                            wide
                        />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="policy-page">
                <h1 className="policy-page__title">{data.title}</h1>
                {data.sections.map((section) => (
                    <div key={section.heading} className="policy-page__section">
                        <h2 className="policy-page__section-heading">
                            {section.heading}
                        </h2>
                        <PolicyBody text={section.body} />
                    </div>
                ))}
            </div>
        </Layout>
    );
};

export default PolicyPage;