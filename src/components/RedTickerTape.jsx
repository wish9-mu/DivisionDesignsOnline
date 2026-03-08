import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './RedTickerTape.css';

import redLanyard from '../assets/04-RedBaybayin.png';

const RedTickerTape = () => {
    const containerRef = useRef(null);
    const trackRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.to(trackRef.current, {
                xPercent: -50,
                repeat: -1,
                duration: 200, // Matching the slow speed
                ease: 'none',
                modifiers: {
                    xPercent: gsap.utils.unitize(x => parseFloat(x) % 50)
                }
            });
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="red-ticker-section" ref={containerRef} aria-hidden="true">
            <div className="red-ticker-wrapper">
                <div className="red-ticker-track-container">
                    <div className="red-ticker-track" ref={trackRef}>
                        {[...Array(8)].map((_, i) => (
                            <img key={i} src={redLanyard} alt="" className="red-ticker-img" />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default RedTickerTape;
