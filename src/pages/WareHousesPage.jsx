import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'phosphor-react';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

import WareHouseCard from '../components/WareHouseCard';

const WareHousesPage = () => {
    const navigate = useNavigate();
    const { showError, showSuccess } = useAuth();
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('hu') ? 'hu' : 'en';

    const [loading, setLoading] = useState(true);
    const [warehouses, setWarehouses] = useState([]);

    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchWarehouses = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/warehouse');
                setWarehouses(response.data.warehouses);
                //console.log('Warehouses:', response.data.warehouses);
            } catch (error) {
                language === 'hu'
                    ? showError(
                          language,
                          response.data?.messageHu ||
                              'Nem sikerült betölteni a profilt!'
                      )
                    : showError(
                          language,
                          response.data?.messageEn || 'Failed to load profile!'
                      );
            } finally {
                setLoading(false);
            }
        };

        fetchWarehouses();
    }, []);

    return (
        <div className="p-6">
            {isAuthenticated && user?.role === 'admin' && (
                <div className="flex flex-wrap justify-end gap-3 mb-6">
                    <button
                        type="button"
                        onClick={() => navigate('/add-warehouse')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                        <PlusCircle size={18} weight="bold" />
                        {t('warehouse.addNew')}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/add-shelf')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                        <PlusCircle size={18} weight="bold" />
                        {t('shelf.addNew')}
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {warehouses.map((wh) => (
                    <WareHouseCard key={wh.id} warehouse={wh} />
                ))}
            </div>
        </div>
    );
};

export default WareHousesPage;
