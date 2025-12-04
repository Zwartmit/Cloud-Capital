import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

interface CryptoPrice {
    usd: number;
    usd_24h_change: number;
}

interface CoinGeckoResponse {
    bitcoin: CryptoPrice;
}

/**
 * Fetches the current Bitcoin price in USD from CoinGecko API
 * @returns Promise with BTC price in USD
 */
export const getBitcoinPrice = async (): Promise<number> => {
    try {
        const response = await axios.get<CoinGeckoResponse>(
            `${COINGECKO_API}/simple/price`,
            {
                params: {
                    ids: 'bitcoin',
                    vs_currencies: 'usd',
                    include_24hr_change: 'true'
                }
            }
        );

        return response.data.bitcoin.usd;
    } catch (error) {
        console.error('Error fetching Bitcoin price from CoinGecko:', error);
        // Fallback to a default price if API fails
        return 96500; // Approximate current BTC price as fallback
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
        const response = await axios.get<CoinGeckoResponse>(
            `${COINGECKO_API}/simple/price`,
            {
                params: {
                    ids: 'bitcoin',
                    vs_currencies: 'usd',
                    include_24hr_change: 'true'
                }
            }
        );

        return {
            price: response.data.bitcoin.usd,
            change24h: response.data.bitcoin.usd_24h_change
        };
    } catch (error) {
        console.error('Error fetching Bitcoin price from CoinGecko:', error);
        return {
            price: 96500,
            change24h: 0
        };
    }
};

export const cryptoService = {
    getBitcoinPrice,
    getBitcoinPriceWithChange
};
