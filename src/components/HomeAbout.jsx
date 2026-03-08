import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import imgFront from "../assets/Hero2.png";
import imgBack from "../assets/Hero3.png";
import "./HomeAbout.css";

const HomeAbout = () => {
    const sectionRef = useRef(null);
    const stageRef = useRef(null);
    const card1Ref = useRef(null); // Initially back
    const card2Ref = useRef(null); // Initially front

    const isCard1Front = useRef(false);
    const isAnimating = useRef(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Set initial state
            gsap.set(card1Ref.current, {
                x: -20, y: -20, rotationZ: -6, zIndex: 1
            });
            gsap.set(card2Ref.current, {
                x: 20, y: 20, rotationZ: 4, zIndex: 2
            });

            // Cards entrance
            gsap.fromTo(
                [card1Ref.current, card2Ref.current],
                { y: "+=50", opacity: 0 },
                {
                    y: (i) => (i === 0 ? -20 : 20), // Reset back to initial target y offsets
                    opacity: 1,
                    duration: 1,
                    stagger: 0.2,
                    ease: "back.out(1.2)",
                }
            );

            // Text stagger entrance
            gsap.fromTo(
                ".ha-text-stagger",
                { x: 60, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.15,
                    ease: "power3.out",
                    delay: 0.2,
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const handleCardClick = () => {
        if (isAnimating.current) return;
        isAnimating.current = true;

        const backCard = isCard1Front.current ? card2Ref.current : card1Ref.current;
        const frontCard = isCard1Front.current ? card1Ref.current : card2Ref.current;

        const tl = gsap.timeline({
            onComplete: () => {
                isCard1Front.current = !isCard1Front.current;
                gsap.set(backCard, { zIndex: 2 });
                gsap.set(frontCard, { zIndex: 1 });
                isAnimating.current = false;
            },
        });

        // Bring back card over front card temporarily
        gsap.set(backCard, { zIndex: 3 });

        tl.to(backCard, {
            x: 80,
            y: -50,
            rotationZ: 10,
            scale: 1.05,
            duration: 0.4,
            ease: "power2.out",
        })
            .to(backCard, {
                x: 20,
                y: 20,
                rotationZ: 4,
                scale: 1,
                duration: 0.4,
                ease: "power2.inOut",
            }, ">")
            .to(
                frontCard,
                {
                    x: -40,
                    y: 0,
                    rotationZ: -6,
                    scale: 0.95,
                    duration: 0.4,
                    ease: "power2.out",
                },
                0
            )
            .to(
                frontCard,
                {
                    x: -20,
                    y: -20,
                    rotationZ: -6,
                    scale: 1,
                    duration: 0.4,
                    ease: "power2.inOut",
                },
                ">"
            );
    };

    const handleMouseMove = (e) => {
        if (!stageRef.current || isAnimating.current) return;
        const rect = stageRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotateY = (x / rect.width) * 20;
        const rotateX = -(y / rect.height) * 20;

        const frontCard = isCard1Front.current ? card1Ref.current : card2Ref.current;
        const backCard = isCard1Front.current ? card2Ref.current : card1Ref.current;

        gsap.to(frontCard, {
            rotationY: rotateY,
            rotationX: rotateX,
            duration: 0.5,
            ease: "power2.out",
        });

        gsap.to(backCard, {
            rotationY: rotateY * 0.5,
            rotationX: rotateX * 0.5,
            duration: 0.5,
            ease: "power2.out",
        });
    };

    const handleMouseLeave = () => {
        if (isAnimating.current) return;
        const frontCard = isCard1Front.current ? card1Ref.current : card2Ref.current;
        const backCard = isCard1Front.current ? card2Ref.current : card1Ref.current;

        gsap.to([frontCard, backCard], {
            rotationY: 0,
            rotationX: 0,
            duration: 1,
            ease: "elastic.out(1, 0.3)",
        });
    };

    return (
        <section className="ha-section" ref={sectionRef}>
            <div
                className="ha-card-stage"
                ref={stageRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleCardClick}
            >
                <div ref={card1Ref} className="ha-card">
                    <div className="ha-card-shine"></div>
                    <img src={imgBack} alt="Division Designs Lanyard Back" className="ha-card-img" />
                </div>
                <div ref={card2Ref} className="ha-card">
                    <div className="ha-card-shine"></div>
                    <img src={imgFront} alt="Division Designs Lanyard Front" className="ha-card-img" />
                </div>
                <div className="ha-tap-hint">tap to swap ↕</div>
            </div>

            <div className="ha-text-block">
                <h2 className="ha-headline ha-text-stagger">
                    Bold prints, built to represent.
                </h2>
                <p className="ha-body ha-text-stagger">
                    <strong>Division Designs</strong> started as a passion project to give organizations high-quality, custom lanyards that truly stand out. We work closely with every client to make something they're proud to wear — without compromising on quality.
                </p>
                <div className="ha-text-stagger">
                    <Link to="/about" className="ha-btn">Our Story</Link>
                </div>
            </div>
        </section>
    );
};

export default HomeAbout;
