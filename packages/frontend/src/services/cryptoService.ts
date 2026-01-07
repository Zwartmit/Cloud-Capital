import axios from 'axios';

const BINANCE_API = 'https://api.binance.com/api/v3';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const CACHE_KEY = 'btc_price_cache';
const DEFAULT_FALLBACK_PRICE = 92500;

interface BinanceTickerResponse {
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
}

/**
 * Get cached Bitcoin price from localStorage
 */
const getCachedPrice = (): number => {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const price = parseFloat(cached);
            if (!isNaN(price) && price > 0) {
                return price;
            }
        }
    } catch (error) {
        console.error('Error reading cached price:', error);
    }
    return DEFAULT_FALLBACK_PRICE;
};

/**
 * Save Bitcoin price to localStorage cache
 */
const setCachedPrice = (price: number): void => {
    try {
        localStorage.setItem(CACHE_KEY, price.toString());
    } catch (error) {
        console.error('Error caching price:', error);
    }
};

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

        const price = parseFloat(response.data.lastPrice);
        setCachedPrice(price); // Cache successful price
        return price;
    } catch (error) {
        console.error('Binance API failed, trying CoinGecko fallback:', error);

        // Try CoinGecko as fallback
        try {
            const response = await axios.get(
                `${COINGECKO_API}/simple/price`,
                {
                    params: {
                        ids: 'bitcoin',
                        vs_currencies: 'usd'
                    }
                }
            );

            const price = response.data.bitcoin.usd;
            console.log('Successfully fetched price from CoinGecko:', price);
            setCachedPrice(price); // Cache successful price
            return price;
        } catch (fallbackError) {
            const cachedPrice = getCachedPrice();
            console.error('All APIs failed, using cached/fallback price:', cachedPrice);
            return cachedPrice;
        }
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

        const price = parseFloat(response.data.lastPrice);
        const change24h = parseFloat(response.data.priceChangePercent);
        setCachedPrice(price); // Cache successful price

        return {
            price,
            change24h
        };
    } catch (error) {
        console.error('Binance API failed, trying CoinGecko fallback:', error);

        // Try CoinGecko as fallback
        try {
            const response = await axios.get(
                `${COINGECKO_API}/simple/price`,
                {
                    params: {
                        ids: 'bitcoin',
                        vs_currencies: 'usd',
                        include_24hr_change: 'true'
                    }
                }
            );

            const price = response.data.bitcoin.usd;
            const change24h = response.data.bitcoin.usd_24h_change || 0;
            console.log('Successfully fetched price from CoinGecko:', price);
            setCachedPrice(price); // Cache successful price

            return {
                price,
                change24h
            };
        } catch (fallbackError) {
            const cachedPrice = getCachedPrice();
            console.error('All APIs failed, using cached/fallback price:', cachedPrice);
            return {
                price: cachedPrice,
                change24h: 0
            };
        }
    }
};

export const cryptoService = {
    getBitcoinPrice,
    getBitcoinPriceWithChange
};
