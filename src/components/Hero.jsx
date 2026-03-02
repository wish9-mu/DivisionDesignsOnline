import React, { useState, useEffect, useCallback } from 'react';
import './Hero.css';
import hero1 from '../assets/Hero1.png';
import hero2 from '../assets/Hero2.png';
import hero3 from '../assets/Hero3.png';

const slides = [
    {
        id: 1,
        image: hero1,
        eyebrow: 'New Collection',
        title: 'MADE TO STAND OUT',
        subtitle: 'Bold prints, Made to stand out',
        cta1: { label: 'Shop Now', href: '#products' },
        cta2: { label: 'Explore', href: '#about' },
    },
    {
        id: 2,
        image: hero2,
        eyebrow: 'Graphic Art',
        title: 'THE ORIGINAL',
        subtitle: 'Premium graphic design for every occasion.',
        cta1: { label: 'View Gallery', href: '#gallery' },
        cta2: { label: 'Learn More', href: '#services' },
    },
    {
        id: 3,
        image: hero3,
        eyebrow: 'Custom Orders',
        title: 'YOUR BRAND. YOUR WAY.',
        subtitle: 'Style with confidence',
        cta1: { label: 'Order Now', href: '#order' },
        cta2: { label: 'Get a Quote', href: '#contact' },
    },
];

const AUTOPLAY_INTERVAL = 5000;

const Hero = () => {
    const [current, setCurrent] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    const goTo = useCallback((index) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrent(index);
        setTimeout(() => setIsAnimating(false), 700);
    }, [isAnimating]);

    const prev = useCallback(() => {
        goTo((current - 1 + slides.length) % slides.length);
    }, [current, goTo]);

    const next = useCallback(() => {
        goTo((current + 1) % slides.length);
    }, [current, goTo]);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(next, AUTOPLAY_INTERVAL);
        return () => clearInterval(timer);
    }, [next, isPaused]);

    return (
        <section
            className="hero"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            aria-label="Hero Slideshow"
        >
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`hero__slide ${index === current ? 'hero__slide--active' : ''}`}
                    aria-hidden={index !== current}
                >
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className="hero__bg"
                    />
                    <div className="hero__overlay" />
                </div>
            ))}

            {/* Content */}
            <div className="hero__content">
                <p className="hero__eyebrow">{slides[current].eyebrow}</p>
                <h1 className="hero__title">{slides[current].title}</h1>
                <p className="hero__subtitle">{slides[current].subtitle}</p>
                <div className="hero__cta-group">
                    <a href={slides[current].cta1.href} className="hero__btn hero__btn--outline">
                        {slides[current].cta1.label}
                    </a>
                    <a href={slides[current].cta2.href} className="hero__btn hero__btn--ghost">
                        {slides[current].cta2.label}
                    </a>
                </div>
            </div>

            {/* Dots */}
            <div className="hero__dots" role="tablist" aria-label="Slide indicators">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`hero__dot ${index === current ? 'hero__dot--active' : ''}`}
                        onClick={() => goTo(index)}
                        role="tab"
                        aria-selected={index === current}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>

            {/* Pause / Play + Arrows */}
            <div className="hero__controls">
                <button
                    className="hero__control-btn hero__control-btn--pause"
                    onClick={() => setIsPaused((p) => !p)}
                    aria-label={isPaused ? 'Play slideshow' : 'Pause slideshow'}
                >
                    {isPaused ? (
                        /* Play icon */
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                    ) : (
                        /* Pause icon */
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M6 19h4V5H6zm8-14v14h4V5z" />
                        </svg>
                    )}
                </button>
                <button className="hero__control-btn" onClick={prev} aria-label="Previous slide">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
                <button className="hero__control-btn" onClick={next} aria-label="Next slide">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            </div>
        </section>
    );
};

export default Hero;
