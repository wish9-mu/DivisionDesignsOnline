import React from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import FeaturedProduct from '../components/FeaturedProduct';
import HomeAbout from '../components/HomeAbout';

const HomePage = () => (
    <Layout hero={<Hero />} preFooter={<HomeAbout />}>
        <FeaturedProduct />
    </Layout>
);

export default HomePage;
