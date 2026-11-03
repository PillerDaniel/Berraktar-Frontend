import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Landing = () => {
    const { user, isAuthenticated } = useAuth();
    const { t, i18n } = useTranslation();

    const language = i18n.language.startsWith('hu') ? 'hu' : 'en';

    return (
        <div className="p-6 space-y-12">
            {isAuthenticated ? (
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">
                        bejelentkezve: {user?.email}, {user?.role}
                    </h1>
                </div>
            ) : (
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">
                        nincs bejelentkezve
                    </h1>
                </div>
            )}
        </div>
    );
};

export default Landing;
