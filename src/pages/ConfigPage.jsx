import React, { useState, useEffect } from 'react';
import {
    Plus,
    Gear,
    CurrencyDollar,
    Snowflake,
    FloppyDisk,
} from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import axiosInstance from '../utils/axios';

const ConfigPage = () => {
    const { showError, showSuccess } = useAuth();
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('hu') ? 'hu' : 'en';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [cfg, setCfg] = useState({
        id: '',
        unitPrice: 0,
        refrigeratedMultiplier: 0,
    });

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await axiosInstance.get('/admin/config');
                console.log(response.data);
                if (response.data?.config) {
                    setCfg(response.data.config);
                }
            } catch (error) {
                language === 'hu'
                    ? showError(
                          language,
                          response.data?.messageHu ||
                              'Nem sikerült betölteni a Konfigurációt!'
                      )
                    : showError(
                          language,
                          response.data?.messageEn || 'Failed to load Config!'
                      );
            } finally {
                setLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCfg((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);
        try {
            const payload = {
                unitPrice: Number(cfg.unitPrice),
                refrigeratedMultiplier: Number(cfg.refrigeratedMultiplier),
            };

            const response = await axiosInstance.put(`/admin/config`, payload);

            language === 'hu'
                ? showSuccess(
                      language,
                      response.data?.messageHu ||
                          'Konfiguráció sikeresen frissítve!'
                  )
                : showSuccess(
                      language,
                      response.data?.messageEn ||
                          'Configuration updated successfully!'
                  );
        } catch (error) {
            language === 'hu'
                ? showError(
                      language,
                      error.response?.data?.messageHu ||
                          'Hiba a konfiguráció mentése során!'
                  )
                : showError(
                      language,
                      error.response?.data?.messageEn ||
                          'Failed to update configuration!'
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
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                    <div className="bg-[#27374D] p-2.5 rounded-lg text-white">
                        <Gear size={28} weight="duotone" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#27374D]">
                            {t('config.title')}
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#27374D] mb-2">
                            <CurrencyDollar size={18} />
                            {t('config.unitPrice')}
                        </label>
                        <input
                            type="number"
                            step="any"
                            name="unitPrice"
                            required
                            value={cfg.unitPrice}
                            onChange={handleChange}
                            className="w-full p-3 bg-[#27374D] text-white placeholder-gray-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#27374D] mb-2">
                            <Snowflake size={18} />
                            {t('config.refrigeratedMultiplier')}
                        </label>
                        <input
                            type="number"
                            step="any"
                            name="refrigeratedMultiplier"
                            required
                            value={cfg.refrigeratedMultiplier}
                            onChange={handleChange}
                            className="w-full p-3 bg-[#27374D] text-white placeholder-gray-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none transition-all"
                        />
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
                                    {t('config.save')}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfigPage;
