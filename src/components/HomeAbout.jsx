import React from 'react';
import { Link } from 'react-router-dom';
import './HomeAbout.css';
import hero2 from '../assets/Hero2.png';
import hero3 from '../assets/Hero3.png';

const HomeAbout = () => (
    <section className="home-about">
        <div className="home-about__images">
            <img src={hero3} alt="Division Designs team" className="home-about__img home-about__img--back" />
            <img src={hero2} alt="Division Designs product" className="home-about__img home-about__img--front" />
        </div>

        <div className="home-about__text">
            <h2 className="home-about__headline">
                Bold prints, built to represent.
            </h2>
            <p className="home-about__body">
                <strong>Division Designs</strong> started as a passion project to give organizations
                high-quality, custom lanyards that truly stand out. We work closely with every
                client to make something they're proud to wear — without compromising on quality.
            </p>
            <Link to="/about" className="home-about__btn">Our Story</Link>
        </div>
    </section>
);

export default HomeAbout;
