import { useState } from 'react';
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from '@headlessui/react';
import { PencilSimple, CreditCard, X } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../utils/axios';

const nextDay = (isoDate) => {
    const date = new Date(`${isoDate}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + 1);
    return date.toISOString().slice(0, 10);
};

// Editing a booking = moving its end date. Later: the price difference is
// paid from the wallet. Earlier (only before the booking starts): the
// difference is refunded. The server calculates both.
const ExtendBookingModal = ({ booking, balance, onClose, onExtended }) => {
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('hu') ? 'hu' : 'en';
    const locale = language === 'hu' ? 'hu-HU' : 'en-GB';

    const [endDate, setEndDate] = useState('');
    const [quote, setQuote] = useState(null);
    const [quoting, setQuoting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    if (!booking) return null;

    const formatMoney = (amount) =>
        `${new Intl.NumberFormat(locale).format(amount)} Ft`;
    const formatDate = (isoDate) =>
        new Date(`${isoDate}T00:00:00`).toLocaleDateString(locale);

    const apiMessage = (error, fallbackKey) => {
        const data = error.response?.data;
        const source = data?.errors?.[0]?.msg ?? data;
        const message =
            language === 'hu' ? source?.messageHu : source?.messageEn;
        return message || t(fallbackKey);
    };

    const handleDateChange = async (e) => {
        const value = e.target.value;
        setEndDate(value);
        setQuote(null);
        setErrorMessage('');

        if (!value || value === booking.endDate) return;

        setQuoting(true);
        try {
            const response = await axiosInstance.post(
                `/booking/${booking.id}/extend/quote`,
                { endDate: value }
            );
            setQuote({ ...response.data.quote, endDate: value });
        } catch (error) {
            setErrorMessage(apiMessage(error, 'booking.edit.quoteError'));
        } finally {
            setQuoting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMessage('');

        try {
            const response = await axiosInstance.post(
                `/booking/${booking.id}/extend`,
                { endDate: quote.endDate }
            );
            onExtended(response.data);
        } catch (error) {
            // 409: the shelves were taken in the meantime, the quote is stale
            if (error.response?.status === 409) {
                setQuote(null);
            }
            setErrorMessage(apiMessage(error, 'booking.edit.error'));
        } finally {
            setSaving(false);
        }
    };

    // a booking that has not started yet can also be made shorter
    const canShorten =
        booking.startDate > new Date().toISOString().slice(0, 10);
    // the server answers a shortening with negative days and amount
    const shortening = quote ? quote.amount < 0 : false;
    const missingAmount = quote && !shortening ? quote.amount - balance : 0;

    return (
        <Dialog open onClose={onClose} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/50" />

            <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
                <DialogPanel className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 text-sm text-[#27374D]">
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#27374D] p-2 rounded-lg text-white">
                                <PencilSimple size={24} weight="fill" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">
                                    {t('booking.edit.title')}
                                </DialogTitle>
                                <p className="text-xs text-gray-500">
                                    {formatDate(booking.startDate)} –{' '}
                                    {formatDate(booking.endDate)} ·{' '}
                                    {t('booking.palletCount', {
                                        count: booking.totalPallets,
                                    })}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label={t('booking.receipt.close')}
                            className="p-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <p className="text-gray-500 mb-4">
                        {t('booking.edit.hint')}
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <label className="flex flex-col gap-1.5 font-semibold">
                            {t('booking.edit.newEndDate')}
                            <input
                                type="date"
                                name="newEndDate"
                                value={endDate}
                                min={nextDay(
                                    canShorten
                                        ? booking.startDate
                                        : booking.endDate
                                )}
                                onChange={handleDateChange}
                                required
                                className="w-full p-2.5 bg-white text-[#27374D] text-sm font-normal border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none"
                            />
                        </label>

                        {quoting && (
                            <div className="flex justify-center py-2">
                                <div className="w-5 h-5 border-2 border-[#27374D]/20 border-t-[#27374D] rounded-full animate-spin" />
                            </div>
                        )}

                        {quote && (
                            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                <dt className="text-gray-500">
                                    {shortening
                                        ? t('booking.edit.fewerDays')
                                        : t('booking.edit.extraDays')}
                                </dt>
                                <dd className="text-right tabular-nums">
                                    {t('booking.days', {
                                        count: Math.abs(quote.extraDays),
                                    })}
                                </dd>

                                <dt className="text-gray-500">
                                    {t('booking.balance')}
                                </dt>
                                <dd className="text-right tabular-nums">
                                    {formatMoney(balance)}
                                </dd>

                                <dt className="font-bold pt-2 border-t border-gray-200">
                                    {shortening
                                        ? t('booking.edit.refund')
                                        : t('booking.edit.difference')}
                                </dt>
                                <dd className="text-right font-bold text-lg tabular-nums pt-2 border-t border-gray-200">
                                    {formatMoney(Math.abs(quote.amount))}
                                </dd>
                            </dl>
                        )}

                        {missingAmount > 0 && (
                            <p className="text-red-700">
                                {t('booking.insufficient', {
                                    amount: formatMoney(missingAmount),
                                })}
                            </p>
                        )}

                        {errorMessage && (
                            <p role="alert" className="text-red-700">
                                {errorMessage}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={saving || !quote || missingAmount > 0}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#27374D] hover:bg-[#1e2b3c] text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <CreditCard size={18} weight="bold" />
                                    {shortening
                                        ? t('booking.edit.submitShorten')
                                        : t('booking.edit.submit')}
                                </>
                            )}
                        </button>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

export default ExtendBookingModal;
