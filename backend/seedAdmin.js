import mongoose from "mongoose"
import bcrypt from "bcrypt"
import User from "./models/User.js"
import "dotenv/config";

export const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const existingAdmin = await User.findOne({ "role": "admin" });
        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }
        const hashedPass = await bcrypt.hash("admin123", 10);
        await User.create(
            {
                firstName: "Super",
                lastName: "Admin",
                email: "admin@gmail.com",
                password: hashedPass,
                role: "admin"
            }
        )
        console.log("Admin created successfully");
        await mongoose.connection.close();
        process.exit(0);
    }
    catch (err) {
        console.log(err);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedAdmin();