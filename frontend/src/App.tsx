import { useEffect, useState } from 'react';
import './App.css';

const BaseURL = 'http://localhost:8000';

function App() {
  const [status, setStatus] = useState('idle');
  const [stockPrices, setStockPrices] = useState<any>([]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('us-EN', {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
    }).format(price);
  };

  const fetchStockPrice = () => {
    setStatus('idle');
    fetch(`${BaseURL}/stocks`, { method: 'GET' })
      .then((res) => (res.status === 200 ? res.json() : setStatus('rejected')))
      .then((result) => setStockPrices(result.data))
      .catch((err) => setStatus('rejected'));
  };

  const updateStockPrices = (data: any) => {
    setStockPrices((stockPrices: any) =>
      [...stockPrices].map((stock) => {
        if (stock.id === data.id) {
          return data;
        }
        return stock;
      })
    );
  };

  useEffect(() => {
    fetchStockPrice();
    const eventSource = new EventSource(`${BaseURL}/realtime-price`, {
      withCredentials: false,
    });

    // listens for incoming messages from server with event name `update`
    eventSource.addEventListener('update', (event: any) => {
      const response = JSON.parse(event.data);
      updateStockPrices(JSON.parse(response.data));
    });

    eventSource.onmessage = (e: any) => {
      console.log('onmessage');
    };

    eventSource.onopen = (event: any) => {
      console.log('connection opened');
    };

    eventSource.addEventListener('ping', (e: any) => {
      console.log(e);
    });

    eventSource.onerror = (event: any) => {
      console.log(event?.target?.readyState);
      if (event.target.readyState === EventSource.CLOSED) {
        console.log('eventsource closed (' + event.target.readyState + ')');
      }
      eventSource.close();
    };

    return () => {
      eventSource.close();
      console.log('eventsource closed');
    };
  }, []);

  return (
    <div>
      <table>
        <caption>Stock Prices {status}</caption>
        <thead>
          <tr>
            <th>S/N</th>
            <th>Ticker Symbol</th>
            <th>Real Time Price</th>
          </tr>
        </thead>
        <tbody>
          {stockPrices.map(({ id, ticker, price }: any, index: number) => (
            <tr key={id}>
              <td>{index + 1}</td>
              <td>{ticker}</td>
              <td>{formatPrice(price)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
