import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './WhiteTickerTape.css';

import whiteLanyard from '../assets/05-WhiteBaybayin.png';

const WhiteTickerTape = () => {
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
        <section className="white-ticker-section" ref={containerRef} aria-hidden="true">
            <div className="white-ticker-wrapper">
                <div className="white-ticker-track-container">
                    <div className="white-ticker-track" ref={trackRef}>
                        {[...Array(8)].map((_, i) => (
                            <img key={i} src={whiteLanyard} alt="" className="white-ticker-img" />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhiteTickerTape;
