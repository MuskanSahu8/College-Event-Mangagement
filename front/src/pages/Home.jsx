
import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarMonth,
  NotificationsActive,
  Groups,
  Star,
  ArrowForward,
  Menu,
} from "@mui/icons-material";

import "../style/home.css";

const Home = () => {
  return (
    <div className="home-container">

      {/* NAVBAR */}
      <nav className="home-navbar">

        <Link to="/" className="home-logo">
          <CalendarMonth />
          <span>CampusConnect</span>
        </Link>

        <div className="home-nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="home-auth-buttons">
          <Link to="/signin" className="home-login">
            Sign In
          </Link>

          <Link to="/signup" className="home-signup">
            Sign Up
          </Link>
        </div>

        <button className="mobile-menu">
          <Menu />
        </button>

      </nav>

      {/* HERO SECTION */}
      <section className="hero-section" id="home">

        <div className="hero-content">

          <span className="hero-tag">
            ✨ College Event Management System
          </span>

          <h1>
            Discover Events.
            <span> Create Memories.</span>
          </h1>

          <p>
            Your one-stop platform to explore college events,
            register for exciting activities, and stay connected
            with your college community.
          </p>

          <div className="hero-buttons">

            <Link to="/signin" className="explore-btn">
              Explore Events <ArrowForward />
            </Link>

          

          </div>

        </div>

        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000"
            alt="College event"
          />
        </div>

      </section>

      {/* FEATURES STRIP */}
      <section className="features-strip" id="features">

        <div className="feature-item">
          <CalendarMonth />
          <span>Create & Manage Events</span>
        </div>

        <div className="feature-item">
          <Groups />
          <span>Register for Events</span>
        </div>

        <div className="feature-item">
          <NotificationsActive />
          <span>Get Notifications</span>
        </div>

        <div className="feature-item">
          <Star />
          <span>Share Feedback</span>
        </div>

      </section>

      {/* ABOUT SECTION */}
      <section className="about-section" id="about">

        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=900"
            alt="College students attending an event"
          />
        </div>

        <div className="about-content">

          <span className="section-tag">
            About Our Platform
          </span>

          <h2>
            Bringing Your College
            <span> Community Together</span>
          </h2>

          <p>
            Our Event Management System makes it easier for
            students to discover events and register online,
            while organizers can efficiently create and manage
            college events.
          </p>

        </div>

      </section>

      {/* CONTACT SECTION */}
      <section className="contact-section" id="contact">
        <h2>Be Part of Something Exciting!</h2>

        <p>
          Discover upcoming events and make your college
          experience more memorable.
        </p>

        <Link to="/signup" className="explore-btn">
          Get Started <ArrowForward />
        </Link>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <h3>CampusConnect</h3>
        <p>
          Making college events easier to discover, manage and enjoy.
        </p>
        <span>
          © 2026 CampusConnect. All Rights Reserved.
        </span>
      </footer>

    </div>
  );
};

export default Home;
