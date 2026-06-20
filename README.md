
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS payment_reference TEXT,
ADD COLUMN IF NOT EXISTS paystack_transaction_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'paid',
ADD COLUMN IF NOT EXISTS expected_amount INTEGER,
ADD COLUMN IF NOT EXISTS paid_amount INTEGER,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'NGN',
ADD COLUMN IF NOT EXISTS payment_option TEXT,
ADD COLUMN IF NOT EXISTS booking_status TEXT DEFAULT 'paid';
# Falcon

Falcon is a web application for visualizing and analyzing meteorological data. It provides a user-friendly interface for exploring weather patterns, forecasts, and historical trends.

## Features

- **Interactive Visualizations**: Falcon includes a variety of interactive charts and graphs to help users understand weather data.
- **Customizable Dashboards**: Users can create personalized dashboards to display the weather information that is most relevant to their needs.
- **Advanced Forecasting**: Falcon integrates with leading weather APIs to provide accurate and up-to-date forecasts.
- **Historical Data Analysis**: Users can explore historical weather data to identify long-term trends and patterns.

## Getting Started

To run Falcon locally, follow these steps:

1. Install Node.js (if you haven't already)
2. Clone the repository: git clone https://github.com/FalconTeam/Falcon.git
3. Install dependencies: cd Falcon && npm install
4. Create a .env.local file and add your Gemini API key: GEMINI_API_KEY=your-api-key-here
5. Start the development server: 
pm run dev
6. Open your browser and navigate to http://localhost:3000

## Deployment

Falcon can be deployed to various cloud platforms, including AWS, Azure, and Google Cloud. For detailed deployment instructions, please refer to the [SETUP_GUIDE.md](SETUP_GUIDE.md) file.

## Contributing

We welcome contributions from the community! If you'd like to contribute to Falcon, please follow the guidelines in the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## License

Falcon is licensed under the [MIT License](LICENSE).
