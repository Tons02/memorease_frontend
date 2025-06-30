import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import * as yup from "yup";

export const loginSchema = yup
  .object({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
  })
  .required();

export const changePasswordSchema = yup
  .object({
    old_password: yup.string().required("Username is required"),
    new_password: yup.string().required("Password is required"),
    new_password_confirmation: yup.string().required("Password is required"),
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

export const lotSchema = yup.object({
  lot_number: yup.string().required("Lot Number is required"),
  price: yup
    .number()
    .typeError("Price must be a number")
    .required("Price is required")
    .positive("Price must be greater than 0"),
  status: yup
    .string()
    .oneOf(["available", "reserved", "sold"], "Select a valid status")
    .required("Status is required"),
});
