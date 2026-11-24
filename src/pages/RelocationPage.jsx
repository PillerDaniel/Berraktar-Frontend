import { useEffect, useState } from 'react';
import { ArrowsLeftRight, Warning } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import ShelfAssignmentList from '../components/ShelfAssignmentList';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const daysBetween = (fromIso, toIso) =>
    Math.round(
        (new Date(`${toIso}T00:00:00Z`) - new Date(`${fromIso}T00:00:00Z`)) /
            MS_PER_DAY
    );

const statusStyles = {
    pending: 'bg-amber-100 text-amber-800',
    stored: 'bg-green-100 text-green-800',
};

// Admin view: every active booking; all of its pallets can be moved to
// another active warehouse, or to the overstay warehouse.
const RelocationPage = () => {
    const { showError, showSuccess } = useAuth();
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('hu') ? 'hu' : 'en';
    const locale = language === 'hu' ? 'hu-HU' : 'en-GB';

    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    // chosen target warehouse per booking id
    const [targets, setTargets] = useState({});
    const [movingId, setMovingId] = useState(null);

    const today = toIsoDate(new Date());

    const formatDate = (isoDate) =>
        new Date(`${isoDate}T00:00:00`).toLocaleDateString(locale);

    const apiMessage = (error, fallbackKey) => {
        const data = error.response?.data;
        const source = data?.errors?.[0]?.msg ?? data;
        const message =
            language === 'hu' ? source?.messageHu : source?.messageEn;
        return message || t(fallbackKey);
    };

    const fetchBookings = async () => {
        const response = await axiosInstance.get('/booking/inbound');
        setBookings(response.data?.bookings ?? []);
    };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [warehouseRes] = await Promise.all([
                    axiosInstance.get('/warehouse'),
                    fetchBookings(),
                ]);
                // goods can go to an active warehouse or the overstay one
                setWarehouses(
                    (warehouseRes.data?.warehouses ?? []).filter(
                        (warehouse) => warehouse.active || warehouse.overstay
                    )
                );
            } catch (error) {
                showError(language, apiMessage(error, 'relocation.loadError'));
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const overdueDays = (booking) =>
        booking.status === 'stored' && booking.endDate < today
            ? daysBetween(booking.endDate, today)
            : 0;

    const handleMove = async (bookingId) => {
        const warehouseId = targets[bookingId];
        if (!warehouseId) return;

        setMovingId(bookingId);

        try {
            const response = await axiosInstance.post(
                `/booking/${bookingId}/relocate`,
                { warehouseId }
            );
            // reload to show the new shelves
            await fetchBookings();
            setTargets((current) => ({ ...current, [bookingId]: '' }));
            showSuccess(
                language,
                (language === 'hu'
                    ? response.data.messageHu
                    : response.data.messageEn) || t('relocation.moveSuccess')
            );
        } catch (error) {
            showError(language, apiMessage(error, 'relocation.moveError'));
        } finally {
            setMovingId(null);
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
        <div className="max-w-3xl mx-4 md:mx-auto my-10">
            <section className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="bg-[#27374D] p-2 rounded-lg text-white">
                        <ArrowsLeftRight size={28} weight="bold" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#27374D]">
                            {t('relocation.title')}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {t('relocation.subtitle')}
                        </p>
                    </div>
                </div>

                {bookings.length === 0 ? (
                    <p className="text-sm text-gray-500 mt-4">
                        {t('relocation.empty')}
                    </p>
                ) : (
                    <ul className="flex flex-col gap-4 mt-4">
                        {bookings.map((booking) => {
                            const overdue = overdueDays(booking);
                            const options = warehouses.filter(
                                (warehouse) =>
                                    warehouse.id !== booking.warehouse?.id
                            );

                            return (
                                <li
                                    key={booking.id}
                                    className={`p-4 border rounded-lg text-sm text-[#27374D] ${
                                        overdue > 0
                                            ? 'bg-red-50/60 border-red-200'
                                            : 'bg-gray-50 border-gray-100'
                                    }`}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                                        <div className="min-w-0">
                                            <p className="font-semibold">
                                                {booking.tenant.lastName}{' '}
                                                {booking.tenant.firstName}
                                                <span className="font-normal text-gray-500 break-all">
                                                    {' '}
                                                    · {booking.tenant.email}
                                                </span>
                                            </p>
                                            <p className="text-gray-500">
                                                {formatDate(booking.startDate)}{' '}
                                                – {formatDate(booking.endDate)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            <span
                                                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyles[booking.status]}`}
                                            >
                                                {t(
                                                    `booking.status.${booking.status}`
                                                )}
                                            </span>
                                            {overdue > 0 && (
                                                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 whitespace-nowrap">
                                                    <Warning
                                                        size={14}
                                                        weight="bold"
                                                    />
                                                    {t('relocation.overdue', {
                                                        count: overdue,
                                                    })}
                                                </span>
                                            )}
                                            <p className="font-bold tabular-nums">
                                                {t('booking.palletCount', {
                                                    count: booking.totalPallets,
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <h3 className="font-semibold mt-4 mb-2">
                                        {t('relocation.current')}:{' '}
                                        <span className="font-normal">
                                            {booking.warehouse
                                                ? `${booking.warehouse.city}, ${booking.warehouse.address}`
                                                : '–'}
                                        </span>
                                        {booking.warehouse?.overstay && (
                                            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                                                {t('warehouse.overstay')}
                                            </span>
                                        )}
                                    </h3>
                                    <ShelfAssignmentList
                                        shelves={booking.shelves}
                                    />

                                    {options.length === 0 ? (
                                        <p className="mt-4 text-gray-500">
                                            {t('relocation.noTarget')}
                                        </p>
                                    ) : (
                                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                            <select
                                                value={targets[booking.id] ?? ''}
                                                onChange={(e) =>
                                                    setTargets((current) => ({
                                                        ...current,
                                                        [booking.id]:
                                                            e.target.value,
                                                    }))
                                                }
                                                aria-label={t(
                                                    'relocation.target'
                                                )}
                                                className="flex-1 p-2.5 bg-white text-[#27374D] text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none"
                                            >
                                                <option value="">
                                                    {t('relocation.choose')}
                                                </option>
                                                {options.map((warehouse) => (
                                                    <option
                                                        key={warehouse.id}
                                                        value={warehouse.id}
                                                    >
                                                        {warehouse.city},{' '}
                                                        {warehouse.address}
                                                        {warehouse.overstay
                                                            ? ` ${t('relocation.overstaySuffix')}`
                                                            : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleMove(booking.id)
                                                }
                                                disabled={
                                                    movingId !== null ||
                                                    !targets[booking.id]
                                                }
                                                className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#27374D] hover:bg-[#1e2b3c] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {movingId === booking.id ? (
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <ArrowsLeftRight
                                                            size={18}
                                                            weight="bold"
                                                        />
                                                        {t('relocation.move')}
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default RelocationPage;
