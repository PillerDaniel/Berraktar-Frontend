import { useEffect, useState } from 'react';
import {
    Package,
    Wallet,
    Calculator,
    CreditCard,
    Receipt,
    Plus,
    PencilSimple,
    Trash,
} from 'phosphor-react';
import axiosInstance from '../utils/axios';
import { WALLET_BALANCE_EVENT } from '../utils/walletEvents';
import ReceiptModal from '../components/modals/ReceiptModal';
import DepositModal from '../components/modals/DepositModal';
import ExtendBookingModal from '../components/modals/ExtendBookingModal';
import CancelBookingModal from '../components/modals/CancelBookingModal';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const emptyForm = {
    startDate: '',
    endDate: '',
    pallets: '',
    type: 'none',
    warehouseId: '',
};

const statusStyles = {
    pending: 'bg-amber-100 text-amber-800',
    stored: 'bg-green-100 text-green-800',
    closed: 'bg-gray-200 text-gray-700',
    cancelled: 'bg-red-100 text-red-800',
};

const inputClass =
    'w-full p-2.5 bg-white text-[#27374D] text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none';
const outlineButtonClass =
    'flex items-center gap-1.5 px-3 py-1.5 border border-[#27374D] text-[#27374D] hover:bg-[#27374D] hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer';
const primaryButtonClass =
    'flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#27374D] hover:bg-[#1e2b3c] text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

const toIsoDate = (date) => date.toISOString().slice(0, 10);

const nextDay = (isoDate) => {
    const date = new Date(`${isoDate}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    return toIsoDate(date);
};

const Booking = () => {
    const { showError, showSuccess, user } = useAuth();
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('hu') ? 'hu' : 'en';
    const locale = language === 'hu' ? 'hu-HU' : 'en-GB';

    const [loading, setLoading] = useState(true);
    const [warehouses, setWarehouses] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [balance, setBalance] = useState(0);

    const [form, setForm] = useState(emptyForm);
    const [quote, setQuote] = useState(null);
    const [quoting, setQuoting] = useState(false);
    const [paying, setPaying] = useState(false);

    const [depositOpen, setDepositOpen] = useState(false);

    // id of the booking whose receipt is open
    const [receiptBookingId, setReceiptBookingId] = useState(null);
    // ids of the booking being edited / cancelled
    const [editBookingId, setEditBookingId] = useState(null);
    const [cancelBookingId, setCancelBookingId] = useState(null);
    const [cancelling, setCancelling] = useState(false);

    const today = toIsoDate(new Date());

    const formatMoney = (amount) =>
        `${new Intl.NumberFormat(locale).format(amount)} Ft`;

    const formatDate = (isoDate) =>
        new Date(`${isoDate}T00:00:00`).toLocaleDateString(locale);

    // The API answers either { messageHu, messageEn } or express-validator's
    // { errors: [{ msg: { messageHu, messageEn } }] }.
    const apiMessage = (error, fallbackKey) => {
        const data = error.response?.data;
        const source = data?.errors?.[0]?.msg ?? data;
        const message = language === 'hu' ? source?.messageHu : source?.messageEn;
        return message || t(fallbackKey);
    };

    const fetchBookings = async () => {
        const response = await axiosInstance.get('/booking');
        setBookings(response.data?.bookings ?? []);
    };

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [warehouseRes, walletRes] = await Promise.all([
                    axiosInstance.get('/warehouse'),
                    axiosInstance.get('/wallet'),
                    fetchBookings(),
                ]);
                setWarehouses(
                    (warehouseRes.data?.warehouses ?? []).filter(
                        (warehouse) => warehouse.active
                    )
                );
                setBalance(walletRes.data?.balance ?? 0);
            } catch (error) {
                showError(language, apiMessage(error, 'booking.loadError'));
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    // the balance can be topped up from the user menu while this page is open
    useEffect(() => {
        const onBalanceChanged = (event) => setBalance(event.detail.balance);

        window.addEventListener(WALLET_BALANCE_EVENT, onBalanceChanged);
        return () =>
            window.removeEventListener(WALLET_BALANCE_EVENT, onBalanceChanged);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const next = {
            ...form,
            [name]: name === 'pallets' ? value.replace(/\D/g, '') : value,
        };

        // keep the end date after the start date
        if (name === 'startDate' && next.endDate && next.endDate <= value) {
            next.endDate = '';
        }

        setForm(next);
        // the displayed price belongs to the previous input
        setQuote(null);
    };

    const bookingPayload = (warehouseId) => ({
        startDate: form.startDate,
        endDate: form.endDate,
        pallets: Number(form.pallets),
        type: form.type,
        ...(warehouseId ? { warehouseId } : {}),
    });

    const handleQuote = async (e) => {
        e.preventDefault();
        setQuoting(true);
        setQuote(null);

        try {
            const response = await axiosInstance.post(
                '/booking/quote',
                bookingPayload(form.warehouseId)
            );
            setQuote(response.data.quote);
        } catch (error) {
            showError(language, apiMessage(error, 'booking.quoteError'));
        } finally {
            setQuoting(false);
        }
    };

    const handlePay = async () => {
        setPaying(true);

        try {
            // book the warehouse the quote was calculated for
            const response = await axiosInstance.post(
                '/booking',
                bookingPayload(quote.warehouse.id)
            );
            setBalance(response.data.balance);
            setQuote(null);
            setForm(emptyForm);
            await fetchBookings();
            // show the receipt of the payment that was just made
            setReceiptBookingId(response.data.booking.id);
            showSuccess(
                language,
                (language === 'hu'
                    ? response.data.messageHu
                    : response.data.messageEn) || t('booking.paySuccess')
            );
        } catch (error) {
            // 409: the capacity was taken in the meantime, the quote is stale
            if (error.response?.status === 409) {
                setQuote(null);
            }
            showError(language, apiMessage(error, 'booking.payError'));
        } finally {
            setPaying(false);
        }
    };

    const handleExtended = async (data) => {
        setEditBookingId(null);
        setBalance(data.balance);
        showSuccess(
            language,
            (language === 'hu' ? data.messageHu : data.messageEn) ||
                t('booking.edit.success')
        );

        try {
            await fetchBookings();
        } catch (error) {
            showError(language, apiMessage(error, 'booking.loadError'));
        }
    };

    const handleCancel = async () => {
        setCancelling(true);

        try {
            const response = await axiosInstance.post(
                `/booking/${cancelBookingId}/cancel`
            );
            setBalance(response.data.balance);
            // the freed capacity changes what a displayed quote is worth
            setQuote(null);
            await fetchBookings();
            showSuccess(
                language,
                (language === 'hu'
                    ? response.data.messageHu
                    : response.data.messageEn) || t('booking.cancel.success')
            );
        } catch (error) {
            showError(language, apiMessage(error, 'booking.cancel.error'));
        } finally {
            setCancelling(false);
            setCancelBookingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-[#27374D]/20 border-t-[#27374D] rounded-full animate-spin" />
            </div>
        );
    }

    const formComplete = form.startDate && form.endDate && form.pallets;

    // the end date of a running booking can be moved later
    const canEdit = (booking) =>
        booking.status === 'pending' || booking.status === 'stored';
    // a stored booking cannot be cancelled any more
    const canCancel = (booking) => booking.status === 'pending';

    // a booking can be cancelled only before its start date; the date at the
    // moment of the click decides
    const openCancel = (booking) => {
        if (booking.startDate <= toIsoDate(new Date())) {
            showError(language, t('booking.cancel.tooLate'));
            return;
        }
        setCancelBookingId(booking.id);
    };
    const missingAmount = quote ? quote.totalAmount - balance : 0;

    return (
        <div className="max-w-3xl mx-4 md:mx-auto my-10 flex flex-col gap-6">
            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-6 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#27374D] p-2 rounded-lg text-white">
                            <Package size={28} weight="fill" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#27374D]">
                            {t('booking.title')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[#27374D]">
                        <Wallet size={20} weight="fill" />
                        <span className="text-sm">{t('booking.balance')}:</span>
                        <span className="font-bold tabular-nums">
                            {formatMoney(balance)}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleQuote} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#27374D]">
                            {t('booking.startDate')}
                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                min={today}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </label>

                        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#27374D]">
                            {t('booking.endDate')}
                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                min={nextDay(form.startDate || today)}
                                onChange={handleChange}
                                required
                                className={inputClass}
                            />
                        </label>

                        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#27374D]">
                            {t('booking.pallets')}
                            <input
                                type="text"
                                inputMode="numeric"
                                name="pallets"
                                value={form.pallets}
                                onChange={handleChange}
                                placeholder={t('booking.palletsPlaceholder')}
                                required
                                className={inputClass}
                            />
                        </label>

                        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#27374D]">
                            {t('booking.type')}
                            <select
                                name="type"
                                value={form.type}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="none">
                                    {t('booking.typeNone')}
                                </option>
                                <option value="refrigerated">
                                    {t('booking.typeRefrigerated')}
                                </option>
                            </select>
                        </label>

                        <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#27374D] md:col-span-2">
                            {t('booking.warehouse')}
                            <select
                                name="warehouseId"
                                value={form.warehouseId}
                                onChange={handleChange}
                                className={inputClass}
                            >
                                <option value="">
                                    {t('booking.anyWarehouse')}
                                </option>
                                {warehouses.map((warehouse) => (
                                    <option
                                        key={warehouse.id}
                                        value={warehouse.id}
                                    >
                                        {warehouse.city}, {warehouse.address}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={quoting || !formComplete}
                        className={`${primaryButtonClass} md:self-end`}
                    >
                        {quoting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Calculator size={18} weight="bold" />
                                {t('booking.calculate')}
                            </>
                        )}
                    </button>
                </form>

                {quote && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-bold text-[#27374D] mb-3">
                            {t('booking.quoteTitle')}
                        </h3>

                        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm text-[#27374D]">
                            <dt className="text-gray-500">
                                {t('booking.warehouse')}
                            </dt>
                            <dd className="text-right">
                                {quote.warehouse.city},{' '}
                                {quote.warehouse.address}
                            </dd>

                            <dt className="text-gray-500">
                                {t('booking.period')}
                            </dt>
                            <dd className="text-right">
                                {formatDate(quote.startDate)} –{' '}
                                {formatDate(quote.endDate)} (
                                {t('booking.days', { count: quote.days })})
                            </dd>

                            <dt className="text-gray-500">
                                {t('booking.pallets')}
                            </dt>
                            <dd className="text-right tabular-nums">
                                {quote.pallets} (
                                {quote.type === 'refrigerated'
                                    ? t('booking.typeRefrigerated')
                                    : t('booking.typeNone')}
                                )
                            </dd>

                            <dt className="text-gray-500">
                                {t('booking.unitPrice')}
                            </dt>
                            <dd className="text-right tabular-nums">
                                {formatMoney(quote.pricePerPalletPerDay)}
                            </dd>

                            <dt className="font-bold pt-2 border-t border-gray-200">
                                {t('booking.total')}
                            </dt>
                            <dd className="text-right font-bold text-lg tabular-nums pt-2 border-t border-gray-200">
                                {formatMoney(quote.totalAmount)}
                            </dd>
                        </dl>

                        {missingAmount > 0 && (
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-red-700">
                                    {t('booking.insufficient', {
                                        amount: formatMoney(missingAmount),
                                    })}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setDepositOpen(true)}
                                    className={outlineButtonClass}
                                >
                                    <Plus size={14} weight="bold" />
                                    {t('booking.deposit')}
                                </button>
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handlePay}
                            disabled={paying || missingAmount > 0}
                            className={`${primaryButtonClass} mt-4 w-full`}
                        >
                            {paying ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CreditCard size={18} weight="bold" />
                                    {t('booking.pay')}
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                <h3 className="flex items-center gap-2 text-lg font-bold text-[#27374D] mb-3">
                    <Receipt size={22} weight="fill" />{' '}
                    {t('booking.myBookings')}
                </h3>

                {bookings.length === 0 ? (
                    <p className="text-sm text-gray-500">
                        {t('booking.noBookings')}
                    </p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {bookings.map((booking) => (
                            <li
                                key={booking.id}
                                className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 p-4 bg-gray-50 border border-gray-100 rounded-lg text-sm text-[#27374D]"
                            >
                                <div>
                                    <p className="font-semibold">
                                        {formatDate(booking.startDate)} –{' '}
                                        {formatDate(booking.endDate)}
                                    </p>
                                    <p className="text-gray-500">
                                        {booking.warehouse
                                            ? `${booking.warehouse.city}, ${booking.warehouse.address} · `
                                            : ''}
                                        {t('booking.palletCount', {
                                            count: booking.totalPallets,
                                        })}
                                        {booking.type === 'refrigerated'
                                            ? ` · ${t('booking.typeRefrigerated')}`
                                            : ''}
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {booking.invoice && (
                                        <span className="font-bold tabular-nums">
                                            {formatMoney(
                                                booking.totalAmount ??
                                                    booking.invoice.amount
                                            )}
                                        </span>
                                    )}
                                    <span
                                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[booking.status] ?? statusStyles.closed}`}
                                    >
                                        {t(`booking.status.${booking.status}`)}
                                    </span>
                                    {booking.invoice && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setReceiptBookingId(booking.id)
                                            }
                                            className={outlineButtonClass}
                                        >
                                            <Receipt size={14} weight="bold" />
                                            {t('booking.receipt.open')}
                                        </button>
                                    )}
                                    {canEdit(booking) && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditBookingId(booking.id)
                                            }
                                            className={outlineButtonClass}
                                        >
                                            <PencilSimple
                                                size={14}
                                                weight="bold"
                                            />
                                            {t('booking.edit.open')}
                                        </button>
                                    )}
                                    {canCancel(booking) && (
                                        <button
                                            type="button"
                                            onClick={() => openCancel(booking)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 border border-red-700 text-red-700 hover:bg-red-700 hover:text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
                                        >
                                            <Trash size={14} weight="bold" />
                                            {t('booking.cancel.open')}
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <ReceiptModal
                booking={bookings.find(
                    (booking) => booking.id === receiptBookingId
                )}
                buyerEmail={user?.email}
                onClose={() => setReceiptBookingId(null)}
            />

            <ExtendBookingModal
                key={editBookingId}
                booking={bookings.find(
                    (booking) => booking.id === editBookingId
                )}
                balance={balance}
                onClose={() => setEditBookingId(null)}
                onExtended={handleExtended}
            />

            <CancelBookingModal
                booking={bookings.find(
                    (booking) => booking.id === cancelBookingId
                )}
                cancelling={cancelling}
                onClose={() => setCancelBookingId(null)}
                onConfirm={handleCancel}
            />

            <DepositModal
                open={depositOpen}
                onClose={() => setDepositOpen(false)}
            />
        </div>
    );
};

export default Booking;
