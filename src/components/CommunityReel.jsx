import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, VolumeX } from 'lucide-react';
import gsap from 'gsap';
import './CommunityReel.css';
import { supabase } from '../supabaseClient';

const REEL_DATA = [
    {
        id: 1,
        mediaUrl: '',
        mediaType: 'image',
        username: 'jane_doe',
        platform: 'Instagram',
        caption: 'Repping my college colors 🎓',
        productId: 'f7c81d83-43d9-4089-8dce-094e9f583e76', // Mock product IDs; will try to match real ones or fallback gracefully
    },
    {
        id: 2,
        mediaUrl: '',
        mediaType: 'image',
        username: 'alex_campus',
        platform: 'TikTok',
        caption: 'Must have for everyday wear 💯',
        productId: 'a4b23c91-1234-5678-9abc-def012345678',
    },
    {
        id: 3,
        mediaUrl: '',
        mediaType: 'image',
        username: 'marky_m',
        platform: 'Instagram',
        caption: 'Graduation ready! 📸',
        productId: 'b5c34d02-2345-6789-abcd-ef0123456789',
    },
    {
        id: 4,
        mediaUrl: '',
        mediaType: 'image',
        username: 'sophia.studies',
        platform: 'TikTok',
        caption: 'Library vibes books + division designs',
        productId: 'c6d45e13-3456-7890-bcde-f0123456789a',
    },
    {
        id: 5,
        mediaUrl: '',
        mediaType: 'image',
        username: 'kyle_cruz',
        platform: 'Instagram',
        caption: 'Matchy matchy with the org 🤝',
        productId: 'd7e56f24-4567-8901-cdef-0123456789ab',
    },
    {
        id: 6,
        mediaUrl: '',
        mediaType: 'image',
        username: 'bea_alv',
        platform: 'TikTok',
        caption: 'Campus strolls 🤍',
        productId: 'e8f67035-5678-9012-def0-123456789abc',
    },
    {
        id: 7,
        mediaUrl: '',
        mediaType: 'image',
        username: 'timothy_s',
        platform: 'Instagram',
        caption: 'Class gear check 🎒',
        productId: 'f9078146-6789-0123-ef01-23456789abcd',
    },
    {
        id: 8,
        mediaUrl: '',
        mediaType: 'image',
        username: 'gabyyyy',
        platform: 'TikTok',
        caption: 'Best aesthetic lanyards!',
        productId: '0a189257-7890-1234-f012-3456789abcde',
    },
];

const ITEM_WIDTH = 300; // Includes gap (280px width + 20px gap)
const VISIBLE_COUNT = 7;
const CENTER_INDEX = Math.floor(VISIBLE_COUNT / 2);

const CommunityReel = () => {
    const trackRef = useRef(null);
    const wrapperRef = useRef(null);
    const cardsRef = useRef([]);
    const [fetchedProducts, setFetchedProducts] = useState({});

    // Fetch products on mount
    useEffect(() => {
        const fetchProducts = async () => {
            const { data, error } = await supabase
                .from('products')
                .select('id, name, image_url');
            if (!error && data) {
                const productMap = {};
                data.forEach(p => {
                    productMap[p.id] = p;
                });
                setFetchedProducts(productMap);
            }
        };
        fetchProducts();
    }, []);


    const handleCardEnter = (idx) => {
        if (cardsRef.current[idx]) {
            gsap.to(cardsRef.current[idx], {
                y: -12,
                scale: 1.04,
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                zIndex: 10,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    };

    const handleCardLeave = (idx) => {
        if (cardsRef.current[idx]) {
            gsap.to(cardsRef.current[idx], {
                y: 0,
                scale: 1,
                boxShadow: 'none',
                zIndex: 1,
                duration: 0.3,
                ease: 'power2.out'
            });
        }
    };

    const nudgeScroll = (direction) => {
        if (!trackRef.current || !wrapperRef.current) return;

        const currentX = gsap.getProperty(trackRef.current, "x") || 0;
        const maxScroll = Math.max(0, trackRef.current.scrollWidth - wrapperRef.current.clientWidth);

        let targetX = currentX + (direction * ITEM_WIDTH);

        // Clamp the target to our track boundaries
        if (targetX > 0) targetX = 0;
        if (targetX < -maxScroll) targetX = -maxScroll;

        gsap.to(trackRef.current, {
            x: targetX,
            duration: 0.5,
            ease: 'power2.inOut'
        });
    };

    return (
        <section className="community-reel">
            <div className="community-reel__header">
                <h2 className="community-reel__title">Show Your Style</h2>
                <h3 className="community-reel__subtitle">See what others are wearing!</h3>
                <p className="community-reel__body">
                    From campus fits to graduation day, we'd love to see how you rock your lanyard. Tag us at <strong>@divisiondesigns</strong> and we'll feature you here!
                </p>
            </div>

            <div className="community-reel__carousel">
                <div className="community-reel__track-wrapper" ref={wrapperRef}>
                    <div className="community-reel__track" ref={trackRef}>
                        {REEL_DATA.map((item, idx) => {
                            // Find matching product or use fallback
                            const product = fetchedProducts[item.productId] || {
                                name: 'Awesome Lanyard',
                                image_url: ''
                            };

                            return (
                                <div
                                    key={item.id}
                                    className="community-reel__card-wrapper"
                                    ref={el => cardsRef.current[idx] = el}
                                    onMouseEnter={() => handleCardEnter(idx)}
                                    onMouseLeave={() => handleCardLeave(idx)}
                                    style={{ position: 'relative' }}
                                >
                                    <div className="community-reel__card">
                                        {item.mediaUrl && <img src={item.mediaUrl} alt="User Content" className="community-reel__video-thumb" />}
                                        <div className="community-reel__overlay" />
                                        <div className="community-reel__mute-icon">
                                            <VolumeX size={16} color="#fff" strokeWidth={2.5} />
                                        </div>
                                        <div className="community-reel__info">
                                            <p className="community-reel__user">
                                                <strong>{item.username}</strong> on {item.platform}
                                            </p>
                                            <p className="community-reel__caption">{item.caption}</p>
                                        </div>
                                    </div>
                                    {/* Product Chip */}
                                    <div className="community-reel__chip">
                                        {product.image_url && <img src={product.image_url} alt="Product Thumbnail" className="community-reel__chip-img" />}
                                        <div className="community-reel__chip-text">{product.name}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="community-reel__controls">
                    <button
                        className="community-reel__nav-btn"
                        onClick={() => nudgeScroll(1)} // Left arrow nudges track right (positive targetX addition)
                        aria-label="Previous reel"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        className="community-reel__nav-btn"
                        onClick={() => nudgeScroll(-1)} // Right arrow nudges track left (negative targetX addition)
                        aria-label="Next reel"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CommunityReel;
