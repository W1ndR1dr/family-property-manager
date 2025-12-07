import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Members from "./Members";

import Contributions from "./Contributions";

import Transactions from "./Transactions";

import Mortgage from "./Mortgage";

import Reports from "./Reports";

import Import from "./Import";

import Documents from "./Documents";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Members: Members,
    
    Contributions: Contributions,
    
    Transactions: Transactions,
    
    Mortgage: Mortgage,
    
    Reports: Reports,
    
    Import: Import,
    
    Documents: Documents,
    
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
                
                <Route path="/Members" element={<Members />} />
                
                <Route path="/Contributions" element={<Contributions />} />
                
                <Route path="/Transactions" element={<Transactions />} />
                
                <Route path="/Mortgage" element={<Mortgage />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/Import" element={<Import />} />
                
                <Route path="/Documents" element={<Documents />} />
                
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