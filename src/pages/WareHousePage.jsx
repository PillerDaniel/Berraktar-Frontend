import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    House,
    GlobeHemisphereWest,
    MapPin,
    ArrowLeft,
    Package,
    Snowflake,
    Cube,
    Stack,
    Pencil,
} from 'phosphor-react';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

import ShelfCard from '../components/ShelfCard';

const WareHousePage = () => {
    const { user, isAuthenticated } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const { showError } = useAuth();
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('hu') ? 'hu' : 'en';

    const [warehouse, setWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);

    const totalCapacity =
        warehouse?.shelfs?.reduce(
            (sum, shelf) => sum + (shelf.capacity || 0),
            0
        ) ?? 0;

    useEffect(() => {
        const fetchWarehouseDetails = async () => {
            try {
                const response = await axiosInstance.get(`/warehouse/${id}`);
                if (response.data?.warehouse) {
                    setWarehouse(response.data.warehouse);
                }
            } catch (error) {
                language === 'hu'
                    ? showError(
                          language,
                          error.response?.data?.messageHu ||
                              'Nem sikerült betölteni a raktár adatait!'
                      )
                    : showError(
                          language,
                          error.response?.data?.messageEn ||
                              'Failed to load warehouse details!'
                      );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchWarehouseDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-[#27374D]/20 border-t-[#27374D] rounded-full animate-spin" />
            </div>
        );
    }

    if (!warehouse) {
        return (
            <div className="max-w-4xl mx-auto my-10 p-6 bg-white rounded-xl shadow-md text-center">
                <p className="text-gray-600 mb-4">{t('warehouse.notFound')}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#27374D] text-white rounded-lg hover:bg-[#1e2b3c] transition-colors cursor-pointer"
                >
                    <ArrowLeft size={18} />
                    {t('warehouse.back')}
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto my-10 px-4">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#27374D] hover:text-[#526d82] transition-colors cursor-pointer"
                >
                    <ArrowLeft size={18} weight="bold" />
                    {t('warehouse.backToWarehouses', 'Vissza a raktárakhoz')}
                </button>

                {isAuthenticated && ['admin'].includes(user.role) && (
                    <button
                        type="button"
                        onClick={() =>
                            navigate(`/warehouses/${warehouse.id}/edit`)
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-[#1e2b3c] transition-colors cursor-pointer"
                    >
                        <Pencil size={18} weight="bold" />
                        {t('warehouse.edit')}
                    </button>
                )}
            </div>

            <div className="bg-[#27374D] rounded-2xl shadow-lg p-6 text-white mb-8">
                <div className="flex flex-wrap justify-between items-start gap-4 border-b border-white/15 pb-5 mb-5">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#526d82] p-3 rounded-xl">
                            <House size={32} weight="duotone" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9DB2BF] mb-1">
                                <GlobeHemisphereWest size={15} weight="bold" />
                                <span>{warehouse.country}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold">
                                {warehouse.city}
                            </h1>
                        </div>
                    </div>

                    <span
                        className={`text-xs px-3 py-1 rounded-full border font-bold uppercase ${
                            warehouse.active
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                        }`}
                    >
                        {warehouse.active
                            ? t('warehouse.active')
                            : t('warehouse.inactive')}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-200">
                    <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-[#9DB2BF] shrink-0" />
                        <span>{warehouse.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Package
                            size={18}
                            className="text-[#9DB2BF] shrink-0"
                        />
                        <span>
                            {t('warehouse.totalShelfs')}
                            <strong className="text-white">
                                {warehouse.shelfs?.length ?? 0}
                            </strong>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Stack size={18} className="text-[#9DB2BF] shrink-0" />
                        <span>
                            {t('warehouse.totalCapacity')}
                            <strong className="text-white">
                                {totalCapacity}
                            </strong>
                        </span>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl font-bold text-[#27374D] mb-4 flex items-center gap-2">
                    <Package size={24} weight="duotone" />
                    {t('warehouse.shelfsTitle')}
                </h2>

                {!warehouse.shelfs || warehouse.shelfs.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
                        {t('warehouse.noShelfs')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {warehouse.shelfs.map((shelf) => (
                            <ShelfCard key={shelf.id} shelf={shelf} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WareHousePage;
