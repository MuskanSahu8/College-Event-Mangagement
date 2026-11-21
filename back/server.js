import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const { default: app } = await import("./src/app.js");
const { connectDB } = await import("./src/db/index.js");

connectDB()
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`running on http://localhost:${process.env.PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
        process.exit(1);
    });
console.log("Cloudinary Variables:", {
    cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: !!process.env.CLOUDINARY_API_KEY,
    apiSecret: !!process.env.CLOUDINARY_API_SECRET
});