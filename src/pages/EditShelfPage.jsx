import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
    ArrowLeft,
    Package,
    Snowflake,
    House,
    Stack,
    FloppyDisk,
    CheckCircle,
} from 'phosphor-react';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const EditShelfPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showError, showSuccess } = useAuth();
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('hu') ? 'hu' : 'en';

    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [shelfData, setShelfData] = useState({
        warehouseId: '',
        capacity: '',
        type: 'none',
        status: 'active',
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [shelfResponse, warehousesResponse] = await Promise.all([
                    axiosInstance.get(`/warehouse/shelf/${id}`),
                    axiosInstance.get('/warehouse'),
                ]);

                if (warehousesResponse.data?.warehouses) {
                    setWarehouses(warehousesResponse.data.warehouses);
                }

                if (shelfResponse.data?.shelf) {
                    const { warehouseId, capacity, type, status } =
                        shelfResponse.data.shelf;
                    setShelfData({
                        warehouseId: warehouseId,
                        capacity: capacity,
                        type: type,
                        status: status,
                    });
                }
            } catch (error) {
                language === 'hu'
                    ? showError(
                          language,
                          error.response?.data?.messageHu ||
                              'Nem sikerült betölteni a polc adatait!'
                      )
                    : showError(
                          language,
                          error.response?.data?.messageEn ||
                              'Failed to load shelf details!'
                      );
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInitialData();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShelfData((prev) => ({
            ...prev,
            [name]: name === 'capacity' ? value.replace(/\D/g, '') : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!shelfData.warehouseId || !shelfData.capacity) return;

        setSubmitting(true);
        try {
            const payload = {
                warehouseId: shelfData.warehouseId,
                capacity: Number(shelfData.capacity),
                type: shelfData.type,
                status: shelfData.status,
            };

            const response = await axiosInstance.put(
                `/admin/shelf/${id}`,
                payload
            );

            language === 'hu'
                ? showSuccess(
                      language,
                      response.data?.messageHu ||
                          'A polc sikeresen frissítve lett!'
                  )
                : showSuccess(
                      language,
                      response.data?.messageEn || 'Shelf updated successfully!'
                  );

            navigate(`/warehouses/${shelfData.warehouseId}`);
        } catch (error) {
            language === 'hu'
                ? showError(
                      language,
                      error.response?.data?.messageHu ||
                          'Hiba a polc frissítése során!'
                  )
                : showError(
                      language,
                      error.response?.data?.messageEn ||
                          'Failed to update shelf!'
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
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 mb-6 text-sm font-semibold text-[#27374D] hover:text-[#526d82] transition-colors cursor-pointer"
            >
                <ArrowLeft size={18} weight="bold" />
                {t('warehouse.backToDetails')}
            </button>

            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                    <div className="bg-[#27374D] p-2.5 rounded-lg text-white">
                        <Package size={28} weight="duotone" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#27374D]">
                            {t('shelf.editTitle')}
                        </h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#27374D] mb-2">
                            <House size={18} />
                            {t('shelf.wareHouseLabel')}
                        </label>
                        <select
                            name="warehouseId"
                            required
                            value={shelfData.warehouseId}
                            onChange={handleChange}
                            className="w-full p-3 bg-[#27374D] text-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none transition-all cursor-pointer"
                        >
                            <option value="" disabled>
                                {t('shelf.warehousePlaceholder')}
                            </option>
                            {warehouses.map((wh) => (
                                <option key={wh.id} value={wh.id}>
                                    {wh.country}, {wh.city} – {wh.address}
                                    {!wh.active
                                        ? ` (${t('warehouse.inactive', 'Inaktív')})`
                                        : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#27374D] mb-2">
                            <Stack size={18} />
                            {t('shelf.capacityLabel')}
                        </label>
                        <input
                            type="text"
                            inputMode="numeric"
                            name="capacity"
                            required
                            value={shelfData.capacity}
                            onChange={handleChange}
                            placeholder={t('shelf.capacityPlaceholder')}
                            className="w-full p-3 bg-[#27374D] text-white placeholder-gray-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#27374D] mb-2">
                            <Snowflake size={18} />
                            {t('warehouse.typeLabel')}
                        </label>
                        <select
                            name="type"
                            value={shelfData.type}
                            onChange={handleChange}
                            className="w-full p-3 bg-[#27374D] text-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none transition-all cursor-pointer"
                        >
                            <option value="none">
                                {t('warehouse.type.none')}
                            </option>
                            <option value="refrigerated">
                                {t('warehouse.type.refrigerated')}
                            </option>
                        </select>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-[#27374D] mb-2">
                            <CheckCircle size={18} />
                            {t('shelf.statusLabel')}
                        </label>
                        <select
                            name="status"
                            value={shelfData.status}
                            onChange={handleChange}
                            className="w-full p-3 bg-[#27374D] text-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none transition-all cursor-pointer"
                        >
                            <option value="active">
                                {t('shelf.status.active')}
                            </option>
                            <option value="unused">
                                {t('shelf.status.unused')}
                            </option>
                        </select>
                    </div>

                    <div className="mt-2">
                        <button
                            type="submit"
                            disabled={submitting || !shelfData.warehouseId}
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

export default EditShelfPage;
