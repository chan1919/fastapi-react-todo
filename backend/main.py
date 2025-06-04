import os
import uvicorn


def main():
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
    )


if __name__ == "__main__":
    main()
