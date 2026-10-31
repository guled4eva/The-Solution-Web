import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import PageViewTracker from "./components/PageViewTracker.jsx";
import Home from "./pages/Home.jsx";
import Board from "./pages/Board.jsx";
import Events from "./pages/Events.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import Suggestions from "./pages/Suggestions.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import NotFound from "./pages/NotFound.jsx";
import Editor from "./pages/Editor.jsx";
import Admin from "./pages/Admin.jsx";
import Industry from "./pages/Industry.jsx";
import Jobs from "./pages/Jobs.jsx";
import JobDetail from "./pages/JobDetail.jsx";
import Interviews from "./pages/Interviews.jsx";
import Interview from "./pages/Interview.jsx";

export default function App() {
  return (
    <>
      <a href="#hovedinnhold" className="skip-link" onClick={(e) => {
        // Hash links would trigger the router, so move focus manually
        e.preventDefault();
        const main = document.getElementById("hovedinnhold");
        main?.focus();
        main?.scrollIntoView();
      }}>
        Hopp til hovedinnhold
      </a>
      <ScrollToTop />
      <PageViewTracker />
      <Navbar />
      <main id="hovedinnhold" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/styret" element={<Board />} />
          <Route path="/arrangementer" element={<Events />} />
          <Route path="/arrangementer/:slug" element={<EventDetails />} />
          <Route path="/bedrift" element={<Industry />} />
          <Route path="/bedrift/jobber" element={<Jobs />} />
          <Route path="/bedrift/jobber/:slug" element={<JobDetail />} />
          <Route path="/bedrift/intervjuer" element={<Interviews />} />
          <Route path="/bedrift/intervjuer/:slug" element={<Interview />} />
          <Route path="/forslagsboksen" element={<Suggestions />} />
          <Route path="/om-oss" element={<About />} />
          <Route path="/kontakt" element={<Contact />} />
          <Route path="/loggin/*" element={<Editor />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/:slug" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
