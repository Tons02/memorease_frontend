import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import * as yup from "yup";

const SUPPORTED_FORMATS = [
  "image/jpg",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const loginSchema = yup
  .object({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  })
  .required();

export const changePasswordSchema = yup
  .object({
    old_password: yup.string().required("Old password is required"),
    new_password: yup.string().required("New password is required"),
    new_password_confirmation: yup
      .string()
      .required("Please confirm your password")
      .oneOf([yup.ref("new_password")], "New Passwords must match"),
  })
  .required();

export const registrationSchema = yup
  .object({
    fname: yup.string().required("First Name is required"),
    lname: yup.string().required("Last Name is required"),
    gender: yup
      .string()
      .oneOf(["male", "female"], "Select a valid gender")
      .required("Gender is required"),
    mobile_number: yup
      .string()
      .required("Mobile number is required")
      .matches(
        /^\+63\d{10}$/,
        "Mobile number must start with +63 and be 13 digits"
      ),
    email: yup
      .string()
      .email("Invalid email format")
      .required("Email is required"),
    address: yup.string().required("Address is required"),
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
    password_confirmation: yup
      .string()
      .required("Please confirm your password")
      .oneOf([yup.ref("password")], "Passwords must match"),
  })
  .required();

export const RoleSchema = yup.object({
  name: yup.string().required("Name is required"),
  access_permission: yup
    .array()
    .of(yup.string()) // Ensure it's an array of strings
    .min(1, "At least one permission must be selected") // Ensure at least one permission is selected
    .required("Access Permission is required"),
});

export const UserSchema = yup.object({
  fname: yup.string().required("First Name is required"),
  lname: yup.string().required("Last Name is required"),
  gender: yup
    .string()
    .oneOf(["male", "female"], "Select a valid gender")
    .required("Gender is required"),
  mobile_number: yup
    .string()
    .required("Mobile number is required")
    .matches(
      /^\+63\d{10}$/,
      "Mobile number must start with +63 and be 13 digits"
    ),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  address: yup.string().required("Address is required"),
  username: yup.string().required("Username is required"),
});

export const cemeterySchema = yup.object({
  name: yup.string().required("Name is required"),
  location: yup.string().required("Location is required"),
});

export const lotSchema = yup.object({
  lot_number: yup.string().required("Lot Number is required"),
  // price: yup
  //   .number()
  //   .typeError("Price must be a number")
  //   .required("Price is required")
  //   .positive("Price must be greater than 0"),
  status: yup
    .string()
    .oneOf(
      ["available", "reserved", "sold", "land_mark"],
      "Select a valid status"
    )
    .required("Status is required"),
});

export const deceasedSchema = yup.object({
  lot_image: yup
    .mixed()
    .required("Lot image is required")
    .test("fileType", "Only JPG, PNG, or WEBP images are allowed", (value) => {
      if (typeof value === "string") return true; // allow URL string
      return value && SUPPORTED_FORMATS.includes(value.type);
    })
    .test("fileSize", "Image must be less than 2MB", (value) => {
      if (typeof value === "string") return true; // skip size check for URL
      return value && value.size <= MAX_FILE_SIZE;
    }),
  lot_id: yup
    .number()
    .typeError("Lot ID must be a number")
    .integer("Lot ID must be an integer")
    .required("Lot ID is required"),
  fname: yup.string().required("First Name is required"),
  lname: yup.string().required("Last Name is required"),
  gender: yup
    .string()
    .oneOf(["male", "female"], "Select a valid gender")
    .required("Gender is required"),
  is_private: yup
    .number()
    .transform((value, originalValue) => {
      // Convert string to number
      return originalValue === "" ? undefined : Number(originalValue);
    })
    .oneOf([0, 1], "Select a valid visibility")
    .required("Visibility is required"),
  death_certificate: yup
    .mixed()
    .required("Death certificate is required")
    .test("fileType", "Only JPG, PNG, or WEBP images are allowed", (value) => {
      if (typeof value === "string") return true; // allow URL string
      return value && SUPPORTED_FORMATS.includes(value.type);
    })
    .test("fileSize", "Image must be less than 2MB", (value) => {
      if (typeof value === "string") return true; // skip size check for URL
      return value && value.size <= MAX_FILE_SIZE;
    }),
  birthday: yup.string().required("Birthday is required"),
  death_date: yup.string().required("Death Date is required"),
});

export const reservationSchema = yup.object({
  lot_id: yup.string().required("Lot Id is required"),
  proof_of_payment: yup
    .mixed()
    .required("Proof of Payment is required")
    .test("fileType", "Only JPG, PNG, or WEBP images are allowed", (value) => {
      if (typeof value === "string") return true; // allow URL string
      return value && SUPPORTED_FORMATS.includes(value.type);
    })
    .test("fileSize", "Image must be less than 2MB", (value) => {
      if (typeof value === "string") return true; // skip size check for URL
      return value && value.size <= MAX_FILE_SIZE;
    }),
});

export const rejectReservationSchema = yup.object({
  remarks: yup.string().required("Remarks is required"),
});

export const startConversationSchema = yup.object({
  user_id: yup.string().required("User is required"),
});

export const changeEmailSchema = yup.object().shape({
  new_email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
});

export const walkInSchema = yup.object({
  lot_id: yup.string().required("Please select a lot"),
  fname: yup.string().required("First Name is required"),
  lname: yup.string().required("Last Name is required"),
  gender: yup
    .string()
    .oneOf(["male", "female"], "Select a valid gender")
    .required("Gender is required"),
  mobile_number: yup
    .string()
    .required("Mobile number is required")
    .matches(
      /^\+63\d{10}$/,
      "Mobile number must start with +63 and be 13 digits"
    ),
  address: yup.string().required("Address is required"),
  username: yup.string().required("Username is required"),
  proof_of_payment: yup
    .mixed()
    .required("Proof of Payment is required")
    .test("fileType", "Only JPG, PNG, or WEBP images are allowed", (value) => {
      if (typeof value === "string") return true; // allow URL string
      return value && SUPPORTED_FORMATS.includes(value.type);
    })
    .test("fileSize", "Image must be less than 2MB", (value) => {
      if (typeof value === "string") return true; // skip size check for URL
      return value && value.size <= MAX_FILE_SIZE;
    }),
});
