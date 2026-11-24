import { useEffect, useState } from 'react';
import { SignOut, Warning, CheckCircle, Clock } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import ShelfAssignmentList from '../components/ShelfAssignmentList';

const toIsoDate = (date) => date.toISOString().slice(0, 10);

// Warehouseman view: the stored goods. Taking them out closes the booking;
// goods left after the end date cost an overstay fee, charged to the tenant.
const OutboundPage = () => {
    const { showError, showSuccess } = useAuth();
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('hu') ? 'hu' : 'en';
    const locale = language === 'hu' ? 'hu-HU' : 'en-GB';

    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [releasingId, setReleasingId] = useState(null);

    const today = toIsoDate(new Date());

    const formatDate = (isoDate) =>
        new Date(`${isoDate}T00:00:00`).toLocaleDateString(locale);

    const formatMoney = (amount) =>
        `${new Intl.NumberFormat(locale).format(amount)} Ft`;

    const apiMessage = (error, fallbackKey) => {
        const data = error.response?.data;
        const source = data?.errors?.[0]?.msg ?? data;
        const message =
            language === 'hu' ? source?.messageHu : source?.messageEn;
        return message || t(fallbackKey);
    };

    useEffect(() => {
        const fetchOutbound = async () => {
            try {
                const response = await axiosInstance.get('/booking/outbound');
                setBookings(response.data?.bookings ?? []);
            } catch (error) {
                showError(language, apiMessage(error, 'outbound.loadError'));
            } finally {
                setLoading(false);
            }
        };

        fetchOutbound();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleRelease = async (bookingId) => {
        setReleasingId(bookingId);

        try {
            const response = await axiosInstance.post(
                `/booking/${bookingId}/release`
            );
            // a closed booking has left the warehouse
            setBookings((current) =>
                current.filter((booking) => booking.id !== bookingId)
            );
            showSuccess(
                language,
                (language === 'hu'
                    ? response.data.messageHu
                    : response.data.messageEn) || t('outbound.releaseSuccess')
            );
        } catch (error) {
            showError(language, apiMessage(error, 'outbound.releaseError'));
        } finally {
            setReleasingId(null);
        }
    };

    const deadlineBadge = (booking) => {
        if (booking.overdueDays > 0) {
            return (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 whitespace-nowrap">
                    <Warning size={14} weight="bold" />
                    {t('outbound.overdue', { count: booking.overdueDays })}
                </span>
            );
        }

        if (booking.endDate === today) {
            return (
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 whitespace-nowrap">
                    <Clock size={14} weight="bold" />
                    {t('outbound.dueToday')}
                </span>
            );
        }

        return (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 whitespace-nowrap">
                {t('outbound.onTime')}
            </span>
        );
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
                        <SignOut size={28} weight="fill" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-[#27374D]">
                            {t('outbound.title')}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {t('outbound.subtitle')}
                        </p>
                    </div>
                    <span className="px-2.5 py-1 bg-[#27374D]/10 text-[#27374D] text-sm font-bold rounded-full tabular-nums">
                        {bookings.length}
                    </span>
                </div>

                {bookings.length === 0 ? (
                    <p className="text-sm text-gray-500 mt-4">
                        {t('outbound.empty')}
                    </p>
                ) : (
                    <ul className="flex flex-col gap-4 mt-4">
                        {bookings.map((booking) => (
                            <li
                                key={booking.id}
                                className={`p-4 border rounded-lg text-sm text-[#27374D] ${
                                    booking.overdueDays > 0
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
                                            {booking.warehouse
                                                ? `${booking.warehouse.city}, ${booking.warehouse.address}`
                                                : ''}
                                            {booking.warehouse?.overstay && (
                                                <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800">
                                                    {t(
                                                        'outbound.overstayWarehouse'
                                                    )}
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-gray-500">
                                            {formatDate(booking.startDate)} –{' '}
                                            {formatDate(booking.endDate)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        {deadlineBadge(booking)}
                                        <p className="font-bold tabular-nums">
                                            {t('booking.palletCount', {
                                                count: booking.totalPallets,
                                            })}
                                        </p>
                                    </div>
                                </div>

                                <h3 className="font-semibold mt-4 mb-2">
                                    {t('outbound.takeFrom')}
                                </h3>
                                <ShelfAssignmentList shelves={booking.shelves} />

                                {booking.overstayFee > 0 && (
                                    <div className="flex items-center justify-between mt-4 px-3 py-2 bg-white border border-red-200 rounded-lg">
                                        <span className="font-semibold text-red-800">
                                            {t('outbound.overstayFee')}
                                        </span>
                                        <span className="font-bold tabular-nums text-red-800">
                                            {formatMoney(booking.overstayFee)}
                                        </span>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => handleRelease(booking.id)}
                                    disabled={releasingId !== null}
                                    className="flex items-center justify-center gap-1.5 w-full mt-4 px-4 py-2.5 bg-[#27374D] hover:bg-[#1e2b3c] text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {releasingId === booking.id ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle
                                                size={18}
                                                weight="bold"
                                            />
                                            {booking.overstayFee > 0
                                                ? t('outbound.releaseWithFee', {
                                                      amount: formatMoney(
                                                          booking.overstayFee
                                                      ),
                                                  })
                                                : t('outbound.release')}
                                        </>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default OutboundPage;
