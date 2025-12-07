import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";
import Members from "./Members";
import Contributions from "./Contributions";
import Transactions from "./Transactions";
import Mortgage from "./Mortgage";
import Reports from "./Reports";
import Import from "./Import";
import Documents from "./Documents";
import Settings from "./Settings";
import Property from "./Property";
import Distributions from "./Distributions";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    Dashboard: Dashboard,
    Property: Property,
    Members: Members,
    Contributions: Contributions,
    Transactions: Transactions,
    Distributions: Distributions,
    Mortgage: Mortgage,
    Documents: Documents,
    Reports: Reports,
    Import: Import,
    Settings: Settings,
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/Property" element={<Property />} />
                <Route path="/Members" element={<Members />} />
                <Route path="/Contributions" element={<Contributions />} />
                <Route path="/Transactions" element={<Transactions />} />
                <Route path="/Distributions" element={<Distributions />} />
                <Route path="/Mortgage" element={<Mortgage />} />
                <Route path="/Documents" element={<Documents />} />
                <Route path="/Reports" element={<Reports />} />
                <Route path="/Import" element={<Import />} />
                <Route path="/Settings" element={<Settings />} />
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}