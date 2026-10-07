import React from "react";
import Hero from "../sections/Hero";
import Marquee from "../sections/Marquee";
import Destinations from "../sections/Destinations";
import Fleet from "../sections/Fleet";
import WhyUs from "../sections/WhyUs";
import Reviews from "../sections/Reviews";
import BookingForm from "../sections/BookingForm";

export default function Home({ onOpenWriteReview }) {
  return (
    <main>
      <Hero />
      <Marquee />
      <Destinations />
      <Fleet />
      <WhyUs />
      <Reviews onOpenWriteReview={onOpenWriteReview} />
      <BookingForm />
    </main>
  );
}
