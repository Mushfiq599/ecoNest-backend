import { Schema, model, Document } from "mongoose";

export interface ISettings extends Document {
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  emailNotifications: boolean;
}

const settingsSchema = new Schema<ISettings>({
  maintenanceMode: { type: Boolean, default: false },
  allowNewRegistrations: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: true },
});

export const Settings = model<ISettings>("Settings", settingsSchema);