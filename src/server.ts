import app from "./app";

const bootstrap = () => {
    try {
        app.listen(process.env.PORT || 4000, () => {
            console.log(`Server is running on http://localhost:${process.env.PORT || 4000}`);
        });
    } catch (error) {
        console.error("Failed to start the server:", error);
    }
}

bootstrap();