import './App.css';
import '../i18n';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

//context
import { AuthProvider } from './contexts/AuthContext';

import ProtectedRoute from './routes/ProtectedRoute';

//components
import Navbar from '../src/components/Navbar';

//pages
import Landing from '../src/pages/Landing';
import NotFound from '../src/pages/NotFound';
import Unauthorized from '../src/pages/Unauthorized';
import Login from '../src/pages/Login';
import Register from '../src/pages/Register';
import Profile from './pages/Profile';

function App() {
    return (
        <AuthProvider>
            <div className="min-h-screen flex flex-col">
                <Router>
                    <Navbar />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="*" element={<NotFound />} />
                            <Route
                                path="/unauthorized"
                                element={<Unauthorized />}
                            />
                            <Route path="/" element={<Landing />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            {
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute
                                            element={<Profile />}
                                            allowedRoles={['user', 'admin']}
                                        />
                                    }
                                />
                            }
                        </Routes>
                    </main>
                </Router>
            </div>
        </AuthProvider>
    );
}

export default App;
