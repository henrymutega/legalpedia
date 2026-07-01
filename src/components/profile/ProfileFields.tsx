import { useTranslation } from 'react-i18next';

export interface ProfileFormState {
  full_name: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  address: string;
}

interface Props {
  form: ProfileFormState;
  setForm: (f: ProfileFormState) => void;
}

const inputCls =
  'w-full px-3.5 py-2.5 bg-background border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition';

const ProfileFields = ({ form, setForm }: Props) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          {t('profile.full_name', 'Full Name')} <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          maxLength={120}
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className={inputCls}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t('profile.phone', 'Phone Number')} <span className="text-destructive">*</span>
          </label>
          <input
            type="tel"
            maxLength={40}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t('profile.gender', 'Gender')}
          </label>
          <select
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            className={inputCls}
          >
            <option value="">{t('profile.gender_select', 'Select gender')}</option>
            <option value="male">{t('profile.gender_male', 'Male')}</option>
            <option value="female">{t('profile.gender_female', 'Female')}</option>
            <option value="other">{t('profile.gender_other', 'Other')}</option>
            <option value="prefer_not">{t('profile.gender_prefer_not', 'Prefer not to say')}</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t('profile.date_of_birth', 'Date of Birth')}
          </label>
          <input
            type="date"
            max={new Date().toISOString().slice(0, 10)}
            value={form.date_of_birth}
            onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            {t('profile.address', 'Address')}
          </label>
          <input
            type="text"
            maxLength={200}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileFields;
