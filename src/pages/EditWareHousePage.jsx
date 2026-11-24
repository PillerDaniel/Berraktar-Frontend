import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    House,
    GlobeHemisphereWest,
    Buildings,
    MapPin,
    FloppyDisk,
    ArrowLeft,
    ToggleRight,
} from 'phosphor-react';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const EditWareHousePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showError, showSuccess } = useAuth();
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('hu') ? 'hu' : 'en';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        country: '',
        city: '',
        address: '',
        active: true,
    });
    // the overstay warehouse can never be opened for bookings
    const [overstay, setOverstay] = useState(false);

    useEffect(() => {
        const fetchWarehouse = async () => {
            try {
                const response = await axiosInstance.get(`/warehouse/${id}`);
                if (response.data?.warehouse) {
                    const { country, city, address, active } =
                        response.data.warehouse;
                    setFormData({
                        country: country || '',
                        city: city || '',
                        address: address || '',
                        active: Boolean(active),
                    });
                    setOverstay(Boolean(response.data.warehouse.overstay));
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
            fetchWarehouse();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await axiosInstance.put(
                `/admin/warehouse/${id}`,
                formData
            );

            language === 'hu'
                ? showSuccess(
                      language,
                      response.data?.messageHu ||
                          'A raktár sikeresen frissítve lett.'
                  )
                : showSuccess(
                      language,
                      response.data?.messageEn ||
                          'Warehouse updated successfully.'
                  );

            navigate(`/warehouses/${id}`);
        } catch (error) {
            language === 'hu'
                ? showError(
                      language,
                      error.response?.data?.messageHu ||
                          'Hiba a raktár frissítése során!'
                  )
                : showError(
                      language,
                      error.response?.data?.messageEn ||
                          'Failed to update warehouse!'
                  );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-[#27374D]/20 border-t-[#27374D] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto my-10 px-4">
            <button
                type="button"
                onClick={() => navigate(`/warehouses/${id}`)}
                className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-[#27374D] hover:text-[#526d82] transition-colors cursor-pointer"
            >
                <ArrowLeft size={18} weight="bold" />
                {t('warehouse.backToDetails')}
            </button>

            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                    <div className="bg-[#27374D] p-2.5 rounded-lg text-white">
                        <House size={28} weight="duotone" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#27374D]">
                            {t('warehouse.editTitle')}
                        </h2>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">
                            {id}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#27374D] mb-2">
                            <GlobeHemisphereWest size={18} />
                            {t('warehouse.country')}
                        </label>
                        <input
                            type="text"
                            name="country"
                            required
                            value={formData.country}
                            onChange={handleChange}
                            className="w-full p-3 bg-[#27374D] text-white placeholder-gray-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#27374D] mb-2">
                            <Buildings size={18} />
                            {t('warehouse.city')}
                        </label>
                        <input
                            type="text"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full p-3 bg-[#27374D] text-white placeholder-gray-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#27374D] mb-2">
                            <MapPin size={18} />
                            {t('warehouse.address')}
                        </label>
                        <input
                            type="text"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full p-3 bg-[#27374D] text-white placeholder-gray-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2.5">
                            <ToggleRight
                                size={22}
                                className="text-[#27374D]"
                                weight="duotone"
                            />
                            <div>
                                <span className="text-sm font-semibold text-[#27374D] block">
                                    {t('warehouse.activeStatus')}
                                </span>
                                {overstay && (
                                    <span className="text-xs text-gray-500 block">
                                        {t('warehouse.overstayLocked')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <label
                            className={`relative inline-flex items-center ${overstay ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        >
                            <input
                                type="checkbox"
                                name="active"
                                checked={formData.active}
                                onChange={handleChange}
                                disabled={overstay}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#526D82] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                    </div>

                    <div className="mt-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-[#27374D] hover:bg-[#1e2b3c] text-white font-bold py-3.5 rounded-lg transition-all shadow-md active:scale-[0.99] disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {submitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <FloppyDisk size={20} weight="bold" />
                                    {t('warehouse.saveChanges')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditWareHousePage;
