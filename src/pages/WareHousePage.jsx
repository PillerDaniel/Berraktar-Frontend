import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    House,
    GlobeHemisphereWest,
    MapPin,
    ArrowLeft,
    Package,
    Snowflake,
    Stack,
    Pencil,
    CalendarBlank,
    MagnifyingGlass,
    CheckCircle,
    XCircle,
} from 'phosphor-react';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

import ShelfCard from '../components/ShelfCard';

const WareHousePage = () => {
    const { user, isAuthenticated, showError } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('hu') ? 'hu' : 'en';

    const [warehouse, setWarehouse] = useState(null);
    const [loading, setLoading] = useState(true);

    const [queryParams, setQueryParams] = useState({
        startDate: '',
        endDate: '',
        type: 'none',
        palletCount: '1',
    });

    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [availabilityResult, setAvailabilityResult] = useState(null);

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

    const handleQueryChange = (e) => {
        const { name, value } = e.target;
        setQueryParams((prev) => ({
            ...prev,
            [name]: name === 'palletCount' ? value.replace(/\D/g, '') : value,
        }));
        if (availabilityResult !== null) {
            setAvailabilityResult(null);
        }
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();

        const pallets = Number(queryParams.palletCount);

        if (!queryParams.startDate || !queryParams.endDate || pallets <= 0) {
            showError(
                language,
                language === 'hu'
                    ? 'Kérlek add meg a dátumokat és a raklapok számát (legalább 1)!'
                    : 'Please select dates and pallet count (at least 1)!'
            );
            return;
        }

        setCheckingAvailability(true);
        setAvailabilityResult(null);

        try {
            const response = await axiosInstance.post(
                '/warehouse/availability',
                {
                    id,
                    startDate: queryParams.startDate,
                    endDate: queryParams.endDate,
                    type: queryParams.type,
                    palletCount: pallets,
                }
            );

            setAvailabilityResult(Boolean(response.data?.available));
        } catch (error) {
            language === 'hu'
                ? showError(
                      language,
                      error.response?.data?.messageHu ||
                          'Hiba a foglalhatóság ellenőrzésekor!'
                  )
                : showError(
                      language,
                      error.response?.data?.messageEn ||
                          'Failed to check warehouse availability!'
                  );
        } finally {
            setCheckingAvailability(false);
        }
    };

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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-200 pb-5 border-b border-white/15">
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
                            {t('warehouse.totalShelfs')}{' '}
                            <strong className="text-white">
                                {warehouse.shelfs?.length ?? 0}
                            </strong>
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Stack size={18} className="text-[#9DB2BF] shrink-0" />
                        <span>
                            {t('warehouse.totalCapacity')}{' '}
                            <strong className="text-white">
                                {totalCapacity}
                            </strong>
                        </span>
                    </div>
                </div>

                <form
                    onSubmit={handleSearchSubmit}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-5 items-end"
                >
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#9DB2BF] mb-1.5">
                            <CalendarBlank size={15} weight="bold" />
                            {t('warehouse.startDate', 'Kezdő dátum')}
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            required
                            value={queryParams.startDate}
                            max={queryParams.endDate || undefined}
                            onChange={handleQueryChange}
                            className="w-full px-3 py-2 bg-[#1e2b3c] text-white text-sm border border-white/15 rounded-lg focus:ring-2 focus:ring-[#526d82] outline-none [color-scheme:dark]"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#9DB2BF] mb-1.5">
                            <CalendarBlank size={15} weight="bold" />
                            {t('warehouse.endDate', 'Végdátum')}
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            required
                            value={queryParams.endDate}
                            min={queryParams.startDate || undefined}
                            onChange={handleQueryChange}
                            className="w-full px-3 py-2 bg-[#1e2b3c] text-white text-sm border border-white/15 rounded-lg focus:ring-2 focus:ring-[#526d82] outline-none [color-scheme:dark]"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#9DB2BF] mb-1.5">
                            <Snowflake size={15} weight="bold" />
                            {t('warehouse.typeLabel', 'Típus')}
                        </label>
                        <select
                            name="type"
                            value={queryParams.type}
                            onChange={handleQueryChange}
                            className="w-full px-3 py-2 bg-[#1e2b3c] text-white text-sm border border-white/15 rounded-lg focus:ring-2 focus:ring-[#526d82] outline-none cursor-pointer"
                        >
                            <option value="none">
                                {t('warehouse.type.none', 'Sima')}
                            </option>
                            <option value="refrigerated">
                                {t('warehouse.type.refrigerated', 'Hűtött')}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#9DB2BF] mb-1.5">
                            <Stack size={15} weight="bold" />
                            {t('warehouse.palletCount', 'Raklap (db)')}
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            name="palletCount"
                            required
                            value={queryParams.palletCount}
                            onChange={handleQueryChange}
                            placeholder="1"
                            className="w-full px-3 py-2 bg-[#1e2b3c] text-white text-sm border border-white/15 rounded-lg focus:ring-2 focus:ring-[#526d82] outline-none"
                        />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                        <button
                            type="submit"
                            disabled={checkingAvailability}
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#526d82] hover:bg-[#415667] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                        >
                            {checkingAvailability ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <MagnifyingGlass size={16} weight="bold" />
                                    {t(
                                        'warehouse.searchAvailability',
                                        'Ellenőrzés'
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {availabilityResult !== null && (
                    <div
                        className={`mt-4 p-3 rounded-lg border flex items-center gap-2.5 text-sm font-medium ${
                            availabilityResult
                                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-200'
                                : 'bg-red-500/15 border-red-400/30 text-red-200'
                        }`}
                    >
                        {availabilityResult ? (
                            <>
                                <CheckCircle
                                    size={20}
                                    weight="bold"
                                    className="text-emerald-400 shrink-0"
                                />
                                <span>
                                    {t(
                                        'warehouse.availableSuccess',
                                        `Van szabad kapacitás (${queryParams.palletCount} db raklap) a kiválasztott időszakban!`
                                    )}
                                </span>
                            </>
                        ) : (
                            <>
                                <XCircle
                                    size={20}
                                    weight="bold"
                                    className="text-red-400 shrink-0"
                                />
                                <span>
                                    {t(
                                        'warehouse.availableFail',
                                        `Nincs elegendő szabad kapacitás (${queryParams.palletCount} db raklap) a kiválasztott időszakban.`
                                    )}
                                </span>
                            </>
                        )}
                    </div>
                )}
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
