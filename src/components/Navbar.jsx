import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
} from '@headlessui/react';

import { UserCircle, SignOut, UserCircleGear, Wallet } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import HUflag from '../assets/flags/HUflag';
import GBflag from '../assets/flags/GBflag';

import DepositModal from './modals/DepositModal';

const Navbar = () => {
    const { isAuthenticated, user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    const [depositOpen, setDepositOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    //Permissions
    const UserAccess = ['user', 'admin'];
    const WarehouseAccess = ['warehouseman', 'admin'];
    const AdminAccess = ['admin'];

    return (
        <Disclosure
            as="nav"
            className="relative bg-[#27374D] after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-white/10"
        >
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 items-center justify-between">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        {isAuthenticated && (
                            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/5 hover:text-white">
                                <svg
                                    className="block size-6 group-data-open:hidden"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                                    />
                                </svg>
                                <svg
                                    className="hidden size-6 group-data-open:block"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </DisclosureButton>
                        )}
                    </div>

                    <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex shrink-0 items-center">
                            <Link
                                to="/"
                                className="text-white font-bold text-xl tracking-wider"
                            >
                                LOGO
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:block">
                            <div className="flex space-x-4">
                                <Link
                                    to="/warehouses"
                                    className="text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
                                >
                                    {t('navbar.warehouses')}
                                </Link>
                            </div>
                        </div>

                        {isAuthenticated && UserAccess.includes(user.role) && (
                            <div className="hidden sm:ml-6 sm:block">
                                <div className="flex space-x-4">
                                    <Link
                                        to="/booking"
                                        className="text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
                                    >
                                        {t('navbar.booking')}
                                    </Link>
                                    <Link
                                        to="proba"
                                        className="text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
                                    >
                                        user és admin
                                    </Link>
                                </div>
                            </div>
                        )}
                        {isAuthenticated &&
                            WarehouseAccess.includes(user.role) && (
                                <div className="hidden sm:ml-6 sm:block">
                                    <div className="flex space-x-4">
                                        <Link
                                            to="/inbound"
                                            className="text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
                                        >
                                            {t('navbar.inbound')}
                                        </Link>
                                        <Link
                                            to="/outbound"
                                            className="text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
                                        >
                                            {t('navbar.outbound')}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        {isAuthenticated && AdminAccess.includes(user.role) && (
                            <>
                                <div className="hidden sm:ml-6 sm:block">
                                    <div className="flex space-x-4">
                                        <Link
                                            to="/config"
                                            className="text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
                                        >
                                            {t('navbar.config')}
                                        </Link>
                                        <Link
                                            to="/relocation"
                                            className="text-gray-300 hover:bg-white/5 hover:text-white rounded-md px-3 py-2 text-sm font-medium transition-colors"
                                        >
                                            {t('navbar.relocation')}
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        {!loading && (
                            <div className="flex items-center space-x-2">
                                <Menu as="div" className="relative">
                                    <MenuButton className="flex items-center rounded-full bg-gray-800 p-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:bg-gray-700 border border-white/5">
                                        <span className="text-lg leading-none text-white">
                                            {i18n.language?.startsWith('hu') ? (
                                                <HUflag
                                                    width={18}
                                                    height={12}
                                                />
                                            ) : (
                                                <GBflag
                                                    width={18}
                                                    height={12}
                                                />
                                            )}
                                        </span>
                                    </MenuButton>

                                    <MenuItems className="absolute right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-white/10">
                                        <MenuItem>
                                            <button
                                                onClick={() =>
                                                    changeLanguage('hu')
                                                }
                                                className={`${i18n.language?.startsWith('hu') ? 'bg-white/10 text-white' : 'text-white'} group flex w-full items-center px-4 py-2 text-sm hover:bg-white/5 transition-colors`}
                                            >
                                                <span className="mr-3">HU</span>{' '}
                                                Magyar
                                            </button>
                                        </MenuItem>
                                        <MenuItem>
                                            <button
                                                onClick={() =>
                                                    changeLanguage('en')
                                                }
                                                className={`${i18n.language?.startsWith('en') ? 'bg-white/10 text-white' : 'text-gray-300'} group flex w-full items-center px-4 py-2 text-sm hover:bg-white/5 transition-colors`}
                                            >
                                                <span className="mr-3">US</span>{' '}
                                                English
                                            </button>
                                        </MenuItem>
                                    </MenuItems>
                                </Menu>

                                {isAuthenticated ? (
                                    <Menu as="div" className="relative">
                                        <MenuButton className="relative flex items-center px-3 py-1 rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all hover:bg-gray-700">
                                            <UserCircle
                                                size={32}
                                                weight="fill"
                                                className="text-white"
                                            />
                                            <div className="ml-2 text-white font-medium pr-1 hidden md:block">
                                                {user?.email}
                                            </div>
                                        </MenuButton>

                                        <MenuItems className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <MenuItem>
                                                <button
                                                    className="flex w-full items-center justify-between px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors"
                                                    onClick={handleLogout}
                                                >
                                                    {t('navbar.logout')}
                                                    <SignOut
                                                        size={18}
                                                        weight="bold"
                                                    />
                                                </button>
                                            </MenuItem>
                                            <MenuItem>
                                                <Link
                                                    to="/profile"
                                                    className="flex w-full items-center justify-between px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
                                                >
                                                    {t('navbar.profile')}
                                                    <UserCircleGear
                                                        size={18}
                                                        weight="bold"
                                                    />
                                                </Link>
                                            </MenuItem>
                                            {UserAccess.includes(
                                                user?.role
                                            ) && (
                                                <MenuItem>
                                                    <button
                                                        className="flex w-full items-center justify-between px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
                                                        onClick={() =>
                                                            setDepositOpen(true)
                                                        }
                                                    >
                                                        {t('navbar.deposit')}
                                                        <Wallet
                                                            size={18}
                                                            weight="bold"
                                                        />
                                                    </button>
                                                </MenuItem>
                                            )}
                                        </MenuItems>
                                    </Menu>
                                ) : (
                                    <div>
                                        <Link
                                            to="/login"
                                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors pl-2"
                                        >
                                            {t('navbar.login')}
                                        </Link>
                                        <Link
                                            to="/register"
                                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors pl-2"
                                        >
                                            {t('navbar.register')}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isAuthenticated && (
                <DisclosurePanel className="sm:hidden bg-[#27374D] backdrop-blur-sm">
                    <div className="space-y-1 px-2 pt-2 pb-3">
                        {isAuthenticated && UserAccess.includes(user.role) && (
                            <Link
                                to="/booking"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                            >
                                {t('navbar.booking')}
                            </Link>
                        )}
                        {isAuthenticated && UserAccess.includes(user.role) && (
                            <Link
                                to="/proba"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                            >
                                user és admin
                            </Link>
                        )}
                        {isAuthenticated &&
                            WarehouseAccess.includes(user.role) && (
                                <Link
                                    to="/proba"
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                                >
                                    raktáros és admin
                                </Link>
                            )}
                        {isAuthenticated &&
                            WarehouseAccess.includes(user.role) && (
                                <Link
                                    to="/inbound"
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                                >
                                    {t('navbar.inbound')}
                                </Link>
                            )}
                        {isAuthenticated &&
                            WarehouseAccess.includes(user.role) && (
                                <Link
                                    to="/outbound"
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                                >
                                    {t('navbar.outbound')}
                                </Link>
                            )}
                        {isAuthenticated && AdminAccess.includes(user.role) && (
                            <Link
                                to="/relocation"
                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                            >
                                {t('navbar.relocation')}
                            </Link>
                        )}
                        {isAuthenticated && AdminAccess.includes(user.role) && (
                            <>
                                <Link
                                    to="/proba"
                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:bg-white/5 hover:text-white"
                                >
                                    Csak admin
                                </Link>
                            </>
                        )}
                    </div>
                </DisclosurePanel>
            )}

            <DepositModal
                open={depositOpen}
                onClose={() => setDepositOpen(false)}
            />
        </Disclosure>
    );
};

export default Navbar;
