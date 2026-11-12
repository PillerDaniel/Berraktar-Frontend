import React from 'react';
import { House, GlobeHemisphereWest, MapPin } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const WareHouseCard = ({ warehouse }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const canViewDetails =
        warehouse.active || (isAuthenticated && user?.role === 'admin');

    return (
        <div className="bg-[#27374D] rounded-2xl shadow-sm border border-white/10 p-5 hover:shadow-md transition-shadow flex flex-col h-full justify-between">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-white uppercase tracking-wider">
                        <GlobeHemisphereWest size={16} weight="bold" />
                        {warehouse.country}
                    </span>
                    <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase ${
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

                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <House
                            size={22}
                            className="text-white"
                            weight="duotone"
                        />
                        <h3 className="text-xl font-bold text-white line-clamp-1">
                            {warehouse.city}
                        </h3>
                    </div>

                    <div className="flex items-start gap-1.5 text-sm text-gray-200">
                        <MapPin
                            size={18}
                            className="shrink-0 mt-0.5 text-[#9DB2BF]"
                        />
                        <p className="line-clamp-2">{warehouse.address}</p>
                    </div>
                </div>
            </div>

            {canViewDetails && (
                <div className="pt-4 border-t border-white/10 flex justify-end items-center mt-2">
                    <button
                        onClick={() => navigate(`/warehouses/${warehouse.id}`)}
                        type="button"
                        className="text-white bg-[#526d82] hover:bg-[#415667] focus:ring-4 focus:ring-[#526d82]/40 cursor-pointer rounded-full text-sm px-5 py-2.5 font-medium transition-all active:scale-95 focus:outline-none shadow-sm"
                    >
                        {t('warehouse.details')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WareHouseCard;
