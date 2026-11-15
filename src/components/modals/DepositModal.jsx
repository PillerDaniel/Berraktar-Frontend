import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogBackdrop,
    DialogPanel,
    DialogTitle,
} from '@headlessui/react';
import { Wallet, Plus, X } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../utils/axios';
import { useAuth } from '../../contexts/AuthContext';
import { WALLET_BALANCE_EVENT } from '../../utils/walletEvents';

// Mounted only while the dialog is open, so every opening starts clean.
const DepositDialog = ({ onClose }) => {
    const { showError, showSuccess } = useAuth();
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('hu') ? 'hu' : 'en';
    const locale = language === 'hu' ? 'hu-HU' : 'en-GB';

    const [balance, setBalance] = useState(null);
    const [amount, setAmount] = useState('');
    const [depositing, setDepositing] = useState(false);

    useEffect(() => {
        let cancelled = false;

        axiosInstance
            .get('/wallet')
            .then((response) => {
                if (!cancelled) setBalance(response.data?.balance ?? 0);
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, []);

    const apiMessage = (error) => {
        const data = error.response?.data;
        const source = data?.errors?.[0]?.msg ?? data;
        const message =
            language === 'hu' ? source?.messageHu : source?.messageEn;
        return message || t('booking.depositError');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setDepositing(true);

        try {
            const response = await axiosInstance.post('/wallet/deposit', {
                amount: Number(amount),
            });
            window.dispatchEvent(
                new CustomEvent(WALLET_BALANCE_EVENT, {
                    detail: { balance: response.data.balance },
                })
            );
            showSuccess(
                language,
                (language === 'hu'
                    ? response.data.messageHu
                    : response.data.messageEn) || t('booking.depositSuccess')
            );
            onClose();
        } catch (error) {
            showError(language, apiMessage(error));
        } finally {
            setDepositing(false);
        }
    };

    return (
        <Dialog open onClose={onClose} className="relative z-50">
            <DialogBackdrop className="fixed inset-0 bg-black/50" />

            <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
                <DialogPanel className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 text-sm text-[#27374D]">
                    <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-[#27374D] p-2 rounded-lg text-white">
                                <Wallet size={24} weight="fill" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">
                                    {t('booking.deposit')}
                                </DialogTitle>
                                <p className="text-xs text-gray-500 tabular-nums">
                                    {t('booking.balance')}:{' '}
                                    {balance === null
                                        ? '…'
                                        : `${new Intl.NumberFormat(locale).format(balance)} Ft`}
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

                    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                        <label className="flex flex-col gap-1.5 font-semibold">
                            {t('booking.depositAmount')}
                            <input
                                type="text"
                                inputMode="numeric"
                                name="depositAmount"
                                value={amount}
                                onChange={(e) =>
                                    setAmount(e.target.value.replace(/\D/g, ''))
                                }
                                autoFocus
                                className="w-full p-2.5 bg-white text-[#27374D] text-sm font-normal border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#526D82] outline-none"
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={depositing || !Number(amount)}
                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#27374D] hover:bg-[#1e2b3c] text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {depositing ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Plus size={18} weight="bold" />
                                    {t('booking.depositButton')}
                                </>
                            )}
                        </button>
                    </form>
                </DialogPanel>
            </div>
        </Dialog>
    );
};

const DepositModal = ({ open, onClose }) =>
    open ? <DepositDialog onClose={onClose} /> : null;

export default DepositModal;
