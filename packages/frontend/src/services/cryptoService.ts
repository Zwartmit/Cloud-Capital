import axios from 'axios';

const BINANCE_API = 'https://api.binance.com/api/v3';

interface BinanceTickerResponse {
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
}

/**
 * Fetches the current Bitcoin price in USD from Binance API
 * @returns Promise with BTC price in USD
 */
export const getBitcoinPrice = async (): Promise<number> => {
    try {
        const response = await axios.get<BinanceTickerResponse>(
            `${BINANCE_API}/ticker/24hr`,
            {
                params: {
                    symbol: 'BTCUSDT'
                }
            }
        );

        return parseFloat(response.data.lastPrice);
    } catch (error) {
        console.error('Error fetching Bitcoin price from Binance:', error);
        // Fallback to a default price if API fails
        return 92500; // Updated fallback
    }
};

/**
 * Fetches Bitcoin price with 24h change data
 * @returns Promise with price and change percentage
 */
export const getBitcoinPriceWithChange = async (): Promise<{
    price: number;
    change24h: number;
}> => {
    try {
        const response = await axios.get<BinanceTickerResponse>(
            `${BINANCE_API}/ticker/24hr`,
            {
                params: {
                    symbol: 'BTCUSDT'
                }
            }
        );

        return {
            price: parseFloat(response.data.lastPrice),
            change24h: parseFloat(response.data.priceChangePercent)
        };
    } catch (error) {
        console.error('Error fetching Bitcoin price from Binance:', error);
        return {
            price: 92500,
            change24h: 0
        };
    }
};

export const cryptoService = {
    getBitcoinPrice,
    getBitcoinPriceWithChange
};
