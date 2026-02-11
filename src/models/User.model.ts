import { model, Schema } from "mongoose";
import { IUser, UserRoles } from "@/interfaces/IUser";
import bcrypt from "bcrypt";
import validator from "validator";

const UserSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide valid email"],
      unique: true
    },
    password: {
      type: String,
      select: false,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(UserRoles),
      default: UserRoles.FREELANCER
    },
    location: {
      country: String,
      city: String,
      timezone: {
        type: String,
        default: "UTC"
      }
    },
    freelancerProfile: {
      title: String,
      bio: String,
      skills: [String],
      hourlyRate: Number,
      portfolio: [
        {
          url: String,
          title: String
        }
      ]
    },
    clientProfile: {
      title: String,
      website: String,
      paymentVerified: {
        type: Boolean,
        default: false
      }
    },
    passwordChangedAt: Date
  },
  { timestamps: true }
);

// hash password before save it in database
UserSchema.pre<IUser>("save", async function (): Promise<void> {
  if (!this.isModified("password") || !this.password) return;

  this.password = await bcrypt.hash(this.password, 12);

  return;
});

// Compare two password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

//Check if the password has been changed after JWT token issued
UserSchema.methods.passwordChangedAfter = function (
  TokenIssuedAt: number
): boolean {
  if (!this.passwordChangedAt) return false;
  //   convert time stamp is millisecond
  const MILLISECONDS_IN_SECOND = 1000;
  const passwordChangedAtTimestamp = Math.floor(
    this.passwordChangedAt.getTime() / MILLISECONDS_IN_SECOND
  );
  return passwordChangedAtTimestamp > TokenIssuedAt;
};

const User = model<IUser>("User", UserSchema);

export default User;
