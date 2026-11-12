import { Snowflake, Cube } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { Pencil } from 'phosphor-react';

import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

const ShelfCard = ({ shelf }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isAuthenticated, user } = useAuth();

    const getShelfStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'unused':
                return 'bg-gray-200 text-gray-700 border-gray-300';
            default:
                return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    const getShelfTypeLabel = (type) => {
        switch (type) {
            case 'refrigerated':
                return {
                    label: t('shelf.type.refrigerated'),
                    icon: (
                        <Snowflake
                            size={16}
                            className="text-[#9DB2BF]"
                            weight="bold"
                        />
                    ),
                };
            case 'none':
            default:
                return {
                    label: t('shelf.type.none'),
                    icon: (
                        <Cube
                            size={16}
                            className="text-[#9DB2BF]"
                            weight="bold"
                        />
                    ),
                };
        }
    };

    const typeInfo = getShelfTypeLabel(shelf.type);

    return (
        <div className="bg-[#27374D] rounded-xl p-5 text-white shadow-sm border border-white/10 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
                <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full border font-bold uppercase ${getShelfStatusBadge(
                        shelf.status
                    )}`}
                >
                    {shelf.status}
                </span>
            </div>

            <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-white/10">
                    <span className="text-gray-300">
                        {t('shelf.typeLabel')}
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold">
                        {typeInfo.icon}
                        {typeInfo.label}
                    </span>
                </div>

                <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-300">
                        {t('shelf.capacityLabel')}
                    </span>
                    <span className="font-bold text-base">
                        {shelf.capacity}
                    </span>
                </div>
            </div>
            {isAuthenticated && user?.role === 'admin' && (
                <div className="pt-4 border-t border-white/10 flex justify-end items-center mt-4">
                    <button
                        type="button"
                        onClick={() => navigate(`/shelves/${shelf.id}/edit`)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-700 hover:bg-green-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                        <Pencil size={15} weight="bold" />
                        {t('shelf.edit')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShelfCard;
