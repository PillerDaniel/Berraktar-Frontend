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
import WareHousesPage from './pages/WareHousesPage';
import WareHousePage from './pages/WareHousePage';
import EditWareHousePage from './pages/EditWareHousePage';
import ConfigPage from './pages/ConfigPage';
import CreateWareHousePage from './pages/CreateWareHousePage';
import CreateShelfPage from './pages/CreateShelfPage';
import EditShelfPage from './pages/EditShelfPage';
import Booking from './pages/Booking';
import InboundPage from './pages/InboundPage';

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
                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute
                                        element={<Profile />}
                                        allowedRoles={['user', 'admin']}
                                    />
                                }
                            />
                            <Route
                                path="/warehouses"
                                element={<WareHousesPage />}
                            />
                            <Route
                                path="/warehouses/:id"
                                element={<WareHousePage />}
                            />
                            <Route
                                path="/warehouses/:id/edit"
                                element={
                                    <ProtectedRoute
                                        element={<EditWareHousePage />}
                                        allowedRoles={['admin']}
                                    />
                                }
                            />
                            <Route
                                path="/config"
                                element={
                                    <ProtectedRoute
                                        element={<ConfigPage />}
                                        allowedRoles={['admin']}
                                    />
                                }
                            />
                            <Route
                                path="/add-warehouse"
                                element={
                                    <ProtectedRoute
                                        element={<CreateWareHousePage />}
                                        allowedRoles={['admin']}
                                    />
                                }
                            />
                            <Route
                                path="/add-shelf"
                                element={
                                    <ProtectedRoute
                                        element={<CreateShelfPage />}
                                        allowedRoles={['admin']}
                                    />
                                }
                            />
                            <Route
                                path="/shelves/:id/edit"
                                element={
                                    <ProtectedRoute
                                        element={<EditShelfPage />}
                                        allowedRoles={['admin']}
                                    />
                                }
                            />
                            <Route
                                path="/booking"
                                element={
                                    <ProtectedRoute
                                        element={<Booking />}
                                        allowedRoles={['user', 'admin']}
                                    />
                                }
                            />
                            <Route
                                path="/inbound"
                                element={
                                    <ProtectedRoute
                                        element={<InboundPage />}
                                        allowedRoles={['warehouseman', 'admin']}
                                    />
                                }
                            />
                        </Routes>
                    </main>
                </Router>
            </div>
        </AuthProvider>
    );
}

export default App;
