import { useEffect, useState } from 'react';
import { Truck, CheckCircle, Snowflake, Cube } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';

// Shelves have no label of their own, the first block of the id stands in.
const shelfCode = (shelfId) => `#${shelfId.slice(0, 8)}`;

// Warehouseman view: paid bookings waiting for the goods, with the shelves
// the system assigned. One button confirms the goods are on the shelves.
const InboundPage = () => {
    const { showError, showSuccess } = useAuth();
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('hu') ? 'hu' : 'en';
    const locale = language === 'hu' ? 'hu-HU' : 'en-GB';

    const [loading, setLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [storingId, setStoringId] = useState(null);

    const formatDate = (isoDate) =>
        new Date(`${isoDate}T00:00:00`).toLocaleDateString(locale);

    const apiMessage = (error, fallbackKey) => {
        const data = error.response?.data;
        const source = data?.errors?.[0]?.msg ?? data;
        const message =
            language === 'hu' ? source?.messageHu : source?.messageEn;
        return message || t(fallbackKey);
    };

    useEffect(() => {
        const fetchInbound = async () => {
            try {
                const response = await axiosInstance.get('/booking/inbound');
                setBookings(response.data?.bookings ?? []);
            } catch (error) {
                showError(language, apiMessage(error, 'inbound.loadError'));
            } finally {
                setLoading(false);
            }
        };

        fetchInbound();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleStore = async (bookingId) => {
        setStoringId(bookingId);

        try {
            const response = await axiosInstance.post(
                `/booking/${bookingId}/store`
            );
            // a stored booking is no longer waiting for delivery
            setBookings((current) =>
                current.filter((booking) => booking.id !== bookingId)
            );
            showSuccess(
                language,
                (language === 'hu'
                    ? response.data.messageHu
                    : response.data.messageEn) || t('inbound.storeSuccess')
            );
        } catch (error) {
            showError(language, apiMessage(error, 'inbound.storeError'));
        } finally {
            setStoringId(null);
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
        <div className="max-w-3xl mx-4 md:mx-auto my-10 flex flex-col gap-6">
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="bg-[#27374D] p-2 rounded-lg text-white">
                        <Truck size={28} weight="fill" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-[#27374D]">
                            {t('inbound.title')}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {t('inbound.subtitle')}
                        </p>
                    </div>
                </div>

                {bookings.length === 0 ? (
                    <p className="text-sm text-gray-500 mt-4">
                        {t('inbound.empty')}
                    </p>
                ) : (
                    <ul className="flex flex-col gap-4 mt-4">
                        {bookings.map((booking) => (
                            <li
                                key={booking.id}
                                className="p-4 bg-gray-50 border border-gray-100 rounded-lg text-sm text-[#27374D]"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
                                    <div>
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
                                                ? `${booking.warehouse.city}, ${booking.warehouse.address} · `
                                                : ''}
                                            {formatDate(booking.startDate)} –{' '}
                                            {formatDate(booking.endDate)}
                                        </p>
                                    </div>
                                    <p className="font-bold tabular-nums">
                                        {t('booking.palletCount', {
                                            count: booking.totalPallets,
                                        })}
                                    </p>
                                </div>

                                <h3 className="font-semibold mt-4 mb-2">
                                    {t('inbound.shelves')}
                                </h3>
                                <ul className="flex flex-col gap-2">
                                    {booking.shelves.map((shelf) => (
                                        <li
                                            key={shelf.shelfId}
                                            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2 bg-white border border-gray-200 rounded-lg"
                                        >
                                            <span className="flex items-center gap-2">
                                                {shelf.type ===
                                                'refrigerated' ? (
                                                    <Snowflake
                                                        size={18}
                                                        weight="bold"
                                                    />
                                                ) : (
                                                    <Cube
                                                        size={18}
                                                        weight="bold"
                                                    />
                                                )}
                                                <span
                                                    className="font-mono font-semibold"
                                                    title={shelf.shelfId}
                                                >
                                                    {shelfCode(shelf.shelfId)}
                                                </span>
                                                <span className="text-gray-500">
                                                    {shelf.type ===
                                                    'refrigerated'
                                                        ? t(
                                                              'booking.typeRefrigerated'
                                                          )
                                                        : t(
                                                              'booking.typeNone'
                                                          )}{' '}
                                                    ·{' '}
                                                    {t('inbound.capacity', {
                                                        count: shelf.capacity,
                                                    })}
                                                </span>
                                            </span>
                                            <span className="font-bold tabular-nums">
                                                {t('inbound.putHere', {
                                                    count: shelf.assignedPallets,
                                                })}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    type="button"
                                    onClick={() => handleStore(booking.id)}
                                    disabled={storingId !== null}
                                    className="flex items-center justify-center gap-1.5 w-full mt-4 px-4 py-2.5 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {storingId === booking.id ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle
                                                size={18}
                                                weight="bold"
                                            />
                                            {t('inbound.store')}
                                        </>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default InboundPage;
