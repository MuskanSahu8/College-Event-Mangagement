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
    .catch(console.error);