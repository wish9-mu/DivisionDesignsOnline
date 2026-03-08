import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './TickerTape.css';

import redLanyard from '../assets/01-RedMinimal.png';
import blackLanyard from '../assets/02-BlackMinimal.png';

const TickerTape = () => {
    const containerRef = useRef(null);
    const track1Ref = useRef(null);
    const track2Ref = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate track 1 (red lanyard) moving left
            gsap.to(track1Ref.current, {
                xPercent: -50,
                repeat: -1,
                duration: 200, // Extremely slow
                ease: 'none',
                modifiers: {
                    xPercent: gsap.utils.unitize(x => parseFloat(x) % 50)
                }
            });

            // Animate track 2 (black lanyard) moving right
            gsap.to(track2Ref.current, {
                xPercent: -50,
                repeat: -1,
                duration: 200, // Extremely slow, varying speed
                ease: 'none',
                modifiers: {
                    xPercent: gsap.utils.unitize(x => parseFloat(x) % 50)
                }
            });
            // But wait we want it moving the other way maybe? Let's just make both negative so they scroll left.
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section className="ticker-section" ref={containerRef} aria-hidden="true">
            <div className="ticker-wrapper">

                {/* Track 1: Back strip (e.g. Black) going diagonally one way */}
                <div className="ticker-track-container track-black">
                    <div className="ticker-track" ref={track2Ref}>
                        {/* Repeat image multiple times to create seamless loop. The container is 200vw wide so 50% is 100vw. We need enough images. */}
                        {[...Array(8)].map((_, i) => (
                            <img key={i} src={blackLanyard} alt="" className="ticker-img" />
                        ))}
                    </div>
                </div>

                {/* Track 2: Front strip (e.g. Red) going diagonally the other way */}
                <div className="ticker-track-container track-red">
                    <div className="ticker-track" ref={track1Ref}>
                        {[...Array(8)].map((_, i) => (
                            <img key={i} src={redLanyard} alt="" className="ticker-img" />
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
};

export default TickerTape;
