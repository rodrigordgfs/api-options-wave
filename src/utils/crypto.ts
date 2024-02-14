import { hash, compare } from "bcrypt";

export const hashPassword = async (password: string) => {
  try {
    const saltRounds = 10;
    const hashedPassword = await hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

export const comparePassword = async (password: string, hash: string) => {
  try {
    return await compare(password, hash);
  } catch (error) {
    throw new Error("Error comparing password");
  }
};
