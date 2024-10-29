import '../styles/global.css'; // Import your global CSS here
import { AppProps } from 'next/app';
import { BrowserRouter as Router } from 'react-router-dom';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Router>
      <Component {...pageProps} />
    </Router>
  );
}

export default MyApp;
