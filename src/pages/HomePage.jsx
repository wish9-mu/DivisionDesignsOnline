import React from "react";
import Layout from "../components/Layout";
import Hero from "../components/Hero";
import FeaturedProduct from "../components/FeaturedProduct";
import BestSellers from "../components/BestSellers";
import HomeAbout from "../components/HomeAbout";

const HomePage = () => (
  <Layout hero={<Hero />} preFooter={<HomeAbout />}>
    <FeaturedProduct />
    <BestSellers />
  </Layout>
);

export default HomePage;
