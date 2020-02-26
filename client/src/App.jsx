import React, { useState, useEffect } from 'react';
import { CssBaseline } from '@material-ui/core'

function App() {
  const [data, setData] = useState('Testing...')


  useEffect(() => {
    const getData = async () => {
      const result = await fetch('/scrape');
      const body = await result.text();
      setData(body);
    }

    getData();
  })

  

  return (
    <>
      <CssBaseline />
      <main>
        {data}
      </main>
    </>
  );
}

export default App;
