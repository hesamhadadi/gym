import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  defaultLanguage: 'fa' | 'en' | 'it';
  siteName: string;
  siteDescription: { fa: string; en: string; it: string };
  contactEmail: string;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettings>(
  {
    defaultLanguage: { type: String, enum: ['fa', 'en', 'it'], default: 'fa' },
    siteName: { type: String, default: 'GymFinder' },
    siteDescription: {
      fa: { type: String, default: 'پیدا کردن بهترین باشگاه های ورزشی نزدیک شما' },
      en: { type: String, default: 'Find the best gyms near you' },
      it: { type: String, default: 'Trova le migliori palestre vicino a te' },
    },
    contactEmail: { type: String, default: 'info@gymfinder.com' },
  },
  { timestamps: true }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);
export default Settings;
