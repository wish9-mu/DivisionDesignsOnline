import React from "react";
import Layout from "../components/Layout";
import "./PageStyles.css";

const AboutPage = () => (
  <Layout>
    <div className="page">
      {/* Header */}
      <div className="page__header">
        <p className="page__eyebrow">Company</p>
        <h1 className="page__title">About Division Designs</h1>
        <p className="page__subtitle">Bold prints. Built to represent.</p>
      </div>

      {/* About Us */}
      <div className="about-content">
        <div className="about-grid">
          <div className="about-card">
            <h3>Our Story</h3>
            <p>
              Division Designs started as a passion project to provide
              organizations with high-quality, custom lanyards that truly
              represent their brand and identity.
            </p>
          </div>
          <div className="about-card">
            <h3>Our Craft</h3>
            <p>
              We use premium materials and modern print techniques — from
              dye-sublimation to embroidery — to deliver products that look
              great and last long.
            </p>
          </div>
          <div className="about-card">
            <h3>Our Promise</h3>
            <p>
              Every order is treated with care. We work closely with each client
              to ensure the final product exceeds expectations, every time.
            </p>
          </div>
        </div>

        <div className="about-stats">
          <div className="stat">
            <span className="stat__number">500+</span>
            <span className="stat__label">Orders Fulfilled</span>
          </div>
          <div className="stat">
            <span className="stat__number">50+</span>
            <span className="stat__label">Organizations Served</span>
          </div>
          <div className="stat">
            <span className="stat__number">100%</span>
            <span className="stat__label">Custom Made</span>
          </div>
        </div>
      </div>

      {/* Contact Us — no form, just info */}
      <div className="about-contact">
        <h2 className="about-contact__title">Get In Touch</h2>
        <p className="about-contact__sub">
          Have a question or want to place a custom order? Reach out to us.
        </p>
        <div className="about-contact__info">
          <div className="contact-item">
            <span>divisiondesigns@email.com</span>
          </div>
          <div className="contact-item">
            <span>+63 912 345 6789</span>
          </div>
          <div className="contact-item">
            <span>Manila, Philippines</span>
          </div>
        </div>
      </div>
    </div>
  </Layout>
);

export default AboutPage;
