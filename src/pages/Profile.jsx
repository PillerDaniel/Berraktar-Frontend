import React, { useEffect, useState } from 'react';
import {
    UserCircle,
    GlobeHemisphereWest,
    Buildings,
    MapPin,
    Hash,
    Bank,
} from 'phosphor-react';
import axiosInstance from '../utils/axios';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

import ProfileFieldRow from '../components/ProfileFieldRow';

const Profile = () => {
    const { showError, showSuccess } = useAuth();
    const { t, i18n } = useTranslation();
    const language = i18n.language?.startsWith('hu') ? 'hu' : 'en';

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        country: '',
        city: '',
        postalCode: '',
        address: '',
        bankAccountNumber: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosInstance.get('/profile');
                if (response.data?.profile) {
                    setProfile(response.data.profile);
                }
            } catch (error) {
                language === 'hu'
                    ? showError(
                          language,
                          response.data?.messageHu ||
                              'Nem sikerült betölteni a profilt!'
                      )
                    : showError(
                          language,
                          response.data?.messageEn || 'Failed to load profile!'
                      );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const handleFieldUpdate = async (
        endpoint,
        bodyKey,
        updatedValue,
        fieldName
    ) => {
        try {
            const payload = {
                [bodyKey]:
                    fieldName === 'postalCode'
                        ? Number(updatedValue)
                        : updatedValue,
            };

            const response = await axiosInstance.patch(endpoint, payload);

            setProfile((prev) => ({
                ...prev,
                [fieldName]: updatedValue,
            }));

            language === 'hu'
                ? showSuccess(
                      language,
                      response.data?.messageHu || 'Sikeresen módosítva!'
                  )
                : showSuccess(
                      language,
                      response.data?.messageEn || 'Successfully updated!'
                  );
            return true;
        } catch (error) {
            language === 'hu'
                ? showError(
                      language,
                      error.response?.data?.messageHu || 'Hiba a mentés során!'
                  )
                : showError(
                      language,
                      error.response?.data?.messageEn || 'Failed to update!'
                  );
            return false;
        }
    };

    const formatIbanForDisplay = (iban) => {
        if (!iban) return '';
        return iban
            .replace(/\s+/g, '')
            .replace(/(.{4})/g, '$1 ')
            .trim();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-[#27374D]/20 border-t-[#27374D] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto my-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                <div className="bg-[#27374D] p-2 rounded-lg text-white">
                    <UserCircle size={28} weight="fill" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[#27374D]">
                        {t('profile.title')}
                    </h2>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <ProfileFieldRow
                    icon={GlobeHemisphereWest}
                    label={t('profile.country')}
                    fieldName="country"
                    endpoint="/profile/country"
                    bodyKey="newCountry"
                    currentValue={profile.country}
                    onSave={handleFieldUpdate}
                />

                <ProfileFieldRow
                    icon={Buildings}
                    label={t('profile.city')}
                    fieldName="city"
                    endpoint="/profile/city"
                    bodyKey="newCity"
                    currentValue={profile.city}
                    onSave={handleFieldUpdate}
                />

                <ProfileFieldRow
                    icon={Hash}
                    label={t('profile.postalCode')}
                    fieldName="postalCode"
                    endpoint="/profile/postal-code"
                    bodyKey="newPostalCode"
                    currentValue={profile.postalCode}
                    inputType="number"
                    onSave={handleFieldUpdate}
                />

                <ProfileFieldRow
                    icon={MapPin}
                    label={t('profile.address')}
                    fieldName="address"
                    endpoint="/profile/address"
                    bodyKey="newAddress"
                    currentValue={profile.address}
                    onSave={handleFieldUpdate}
                />

                <ProfileFieldRow
                    icon={Bank}
                    label={t('profile.bankAccountNumber')}
                    fieldName="bankAccountNumber"
                    endpoint="/profile/bank-account-number"
                    bodyKey="newBankAccountNumber"
                    currentValue={profile.bankAccountNumber}
                    formatter={formatIbanForDisplay}
                    onSave={handleFieldUpdate}
                />
            </div>
        </div>
    );
};

export default Profile;
