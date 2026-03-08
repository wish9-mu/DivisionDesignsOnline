import React from "react";
import Layout from "../components/Layout";
import Hero from "../components/Hero";
import FeaturedProduct from "../components/FeaturedProduct";
import BestSellers from "../components/BestSellers";
import HomeAbout from "../components/HomeAbout";
import TickerTape from "../components/TickerTape";

const HomePage = () => (
  <Layout hero={<Hero />} preFooter={<HomeAbout />}>
    <FeaturedProduct />
    <TickerTape />
    <BestSellers />
  </Layout>
);

export default HomePage;
